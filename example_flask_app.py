#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# @Author : dengguo
# @Time : 18-1-3 下午11:17
# @File : example_flask_app.py
# @Software: PyCharm
from flask import Flask
from flask import render_template

flask_app = Flask('flaskapp')


@flask_app.route('/hello/')
def hello_world():
    return render_template('flask_test.html', schedule=[{'time':"10'",
                                                      'competition': '中超',
                                                      'home_team':'1111',
                                                      'away_team': '2222',
                                                      'home_team_score': '1',
                                                      'away_team_score': '2',



    }])


app = flask_app.wsgi_app
