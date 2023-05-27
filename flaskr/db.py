import mysql.connector
from mysql.connector import errorcode

import click
from flask import current_app, g


def get_db():
    if 'db' not in g:
        try:
            g.db = mysql.connector.connect(user=current_app.config['MYSQL_USER'], password=current_app.config["MYSQL_PASSWORD"],
                                           host=current_app.config["MYSQL_HOST"], database=current_app.config["MYSQL_DATABASE"])
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                print("Something is wrong with your user name or password")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                print("Database does not exist")
            else:
                print(err)
    return g.db


def close_db(e=None):
    db = None
    try:
        db = g.pop('db')
    except KeyError as e:
        pass
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    with current_app.open_resource('schema.sql') as f:
        try:
            for result in db.cursor().execute(f.read().decode('utf8'), multi=True):
                print(result.statement)
        except mysql.connector.Error as err:
            print("Failed initialising tables: {}".format(err))
            exit(1)


@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
