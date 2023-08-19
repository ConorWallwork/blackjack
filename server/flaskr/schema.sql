DROP TABLE IF EXISTS round;
DROP TABLE IF EXISTS seat;

CREATE TABLE seat (
    id VARCHAR(32) PRIMARY KEY,
    stack INTEGER NOT NULL,
    nickname TEXT NOT NULL
);

CREATE TABLE round (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    seat_id VARCHAR(32) NOT NULL,
    player_hand JSON,
    dealer_hand JSON,
    deck JSON NOT NULL,
    stage TEXT NOT NULL,
    bet INTEGER NOT NULL,
    has_split BOOLEAN NOT NULL,
    has_doubled_down BOOLEAN NOT NULL,
    hand_sits JSON NOT NULL,
    hand_busts JSON NOT NULL,

    FOREIGN KEY (seat_id) REFERENCES seat (id)
)