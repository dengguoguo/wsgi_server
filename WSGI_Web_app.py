#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# @Author : dengguo
# @Time : 18-1-3 下午11:17
# @File : WSGI_Web_app.py
# @Software: PyCharm
import cgi, re, http
class Application:

    def __init__(self, *args):
        self.environ, self.start_response = args
    def create_start_response(self, html):
        status = '200 OK'
        response_headers = [("Content-type", "text/html")]
        self.start_response(status, response_headers)
        yield html.encode('utf-8')
    def rsponse_body(self, environ, start_response):
        form = cgi.FieldStorage(environ=self.environ, fp=self.environ['wsgi.input'])
        search_image_byte = form.getvalue('form_data')
        reg = r'\r\n\r\n(.+)'
        pattern = re.compile(reg)
        form_data = re.search(pattern, http.decose())
        len_data = len(form_data)

        write = start_response(status='', response_headers='')
        pass