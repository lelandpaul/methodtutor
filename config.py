import os
import datetime
basedir = os.path.abspath(os.path.dirname(__file__))
from dotenv import load_dotenv

load_dotenv(os.path.join(basedir,'.env'))


class Config(object):

    SECRET_KEY = os.getenv('SECRET_KEY') or 'abcde'

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db') + '?check_same_thread=False'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
