import json
from flask import (
    Blueprint,
    current_app,
    request,
)
from werkzeug.exceptions import abort

from flaskr.db import get_db
from flaskr.model.round import Round
from flaskr.model.seat import Seat

bp = Blueprint("seat", __name__)


@bp.route("/new", methods=["POST"])
def new():
    if "nickname" not in request.args:
        abort(400, "nickname is required")

    seat = Seat(current_app.config["STARTING_STACK"], request.args["nickname"])

    try:
        db = get_db()
        db.cursor().execute(
            "INSERT INTO seat (id, stack, nickname) VALUES (%s, %s, %s)",
            (seat.id, seat.stack, seat.nickname),
        )
        db.commit()
    except Exception as e:
        abort(500, e)
    else:
        return {"id": seat.id}


@bp.route("<string:id>")
def get(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)

    return {
        "nickname": seat.nickname,
        "id": seat.id,
        "stack": seat.stack,
        "round": None
        if active_round is None
        else {
            "player_hand": active_round.player_hand,
            "dealer_hand": active_round.dealer_hand,
            "stage": active_round.stage,
            "bet": active_round.bet,
        },
    }


@bp.route("<string:id>/start", methods=["POST"])
def start(id):
    if "bet" not in request.args:
        abort(400, "bet is required")

    seat = get_seat(id)

    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    seat.set_round(active_round)
    try:
        starting_cards = seat.round_start(int(request.args["bet"]))
        db = get_db()
        db.cursor().execute(
            "INSERT INTO round (seat_id, player_hand, dealer_hand, deck, stage, bet, has_split, has_doubled_down, hand_sits, hand_busts) VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s, %s)",
            (
                id,
                json.dumps(seat.round.player_hand),
                json.dumps(seat.round.dealer_hand),
                json.dumps(seat.round.deck),
                seat.round.stage,
                seat.round.bet,
                json.dumps(1 if seat.round.has_split else 0),
                json.dumps(1 if seat.round.has_doubled_down else 0),
                json.dumps(seat.round.hand_sits),
                json.dumps(seat.round.hand_busts),
            ),
        )
        db.commit()
        return starting_cards
    except Exception as e:
        abort(400, e)


@bp.route("<string:id>/hit", methods=["POST"])
def hit(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    if active_round is None:
        abort(400, "This seat does not have an active round")
    seat.set_round(active_round)

    try:
        previous_stack = seat.stack
        card = (
            seat.round_hit(int(request.args["hand"]))
            if "hand" in request.args
            else seat.round_hit()
        )
        if seat.stack != previous_stack:
            # The stack has changed, update seat in db
            update_seat(seat)
        update_round(seat.round)
        return {"card": card}
    except Exception as e:
        abort(400, e)


@bp.route("<string:id>/sit", methods=["POST"])
def sit(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    if active_round is None:
        abort(400, "This seat does not have an active round")
    seat.set_round(active_round)

    try:
        seat.round_sit(
            int(request.args["hand"])
        ) if "hand" in request.args else seat.round_sit()
        update_round(seat.round)
        return ("", 204)
    except Exception as e:
        abort(400, e)


@bp.route("<string:id>/split", methods=["POST"])
def split(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "seat with this ID does not exist")

    active_round = get_active_round(seat)
    if active_round is None:
        abort(400, "This seat does not have an active round")
    seat.set_round(active_round)

    try:
        left_card, right_card = seat.round_split()
        update_round(seat.round)
        return {"left_card": left_card, "right_card": right_card}
    except Exception as e:
        abort(400, e)


@bp.route("<string:id>/end", methods=["POST"])
def end(id):
    seat = get_seat(id)
    if seat is None:
        abort(404, "Seat with this ID does not exist")

    active_round = get_active_round(seat)
    if active_round is None:
        abort(400, "This seat does not have an active round")
    seat.set_round(active_round)

    try:
        dealer_cards = seat.round_end()
        update_seat(seat)
        update_round(seat.round)
        return {"dealer_cards": dealer_cards}
    except Exception as e:
        abort(400, e)


def get_seat(id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id, stack, nickname FROM seat WHERE id=%s", (id,))
    except Exception as e:
        abort(500, e + f"Statement: {cursor.statement}")
    row = cursor.fetchone()
    return None if row is None else Seat(row[1], row[2], id=row[0])


def get_active_round(seat):
    cursor = get_db().cursor()
    try:
        cursor.execute(
            "SELECT bet, player_hand, dealer_hand, deck, stage, id, has_split, has_doubled_down, hand_sits, hand_busts FROM round WHERE seat_id=%s AND stage != 'round_end'",
            (seat.id,),
        )
    except Exception as e:
        abort(500, e)
    row = cursor.fetchone()
    return (
        None
        if row is None
        else Round(
            row[0],
            json.loads(row[1]),
            json.loads(row[2]),
            json.loads(row[3]),
            row[4],
            int(row[5]),
            row[6],
            row[7],
            json.loads(row[8]),
            json.loads(row[9]),
        )
    )


def update_seat(seat):
    db = get_db()
    db.cursor().execute("UPDATE seat SET stack = %s WHERE id=%s", (seat.stack, seat.id))
    db.commit()


# foo


def update_round(round):
    db = get_db()
    db.cursor().execute(
        "UPDATE round SET player_hand = %s, dealer_hand = %s, deck = %s, stage = %s, has_split = %s, has_doubled_down = %s, hand_sits = %s, hand_busts = %s WHERE id=%s",
        (
            json.dumps(round.player_hand),
            json.dumps(round.dealer_hand),
            json.dumps(round.deck),
            round.stage,
            json.dumps(1 if round.has_split else 0),
            json.dumps(1 if round.has_doubled_down else 0),
            json.dumps(round.hand_sits),
            json.dumps(round.hand_busts),
            round.id,
        ),
    )
    db.commit()
