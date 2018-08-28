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
    return render_template('index.html')

app = flask_app.wsgi_app
