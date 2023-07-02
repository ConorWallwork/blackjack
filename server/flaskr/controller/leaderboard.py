import json
from flask import (
    Blueprint, current_app, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from flaskr.db import get_db

bp = Blueprint('leaderboard', __name__)

@bp.route('')
def get():
    leaderboard = []
    
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("""select 	
                            seat.id,
                            seat.stack,
                            seat.nickname,
                            count(round.id) as num_rounds
                        from 
                            seat
                        inner join
                            round
                        on 
                            seat.id = round.seat_id
                        group by
                            seat.id, seat.stack, seat.nickname
                        order by seat.stack desc
                        limit 30""")
    except Exception as e:
        abort(500, e + f'Statement: {cursor.statement}')
    for (id, stack, nickname, num_rounds) in cursor:
        leaderboard.append({
            "id": id,
            "stack": stack,
            "nickname": nickname,
            "num_rounds": num_rounds
        })
    
    return leaderboard
    
    


