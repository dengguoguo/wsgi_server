#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# @Author : dengguo
# @Time : 18-1-3 下午11:09
# @File : WSGI_WEB_Server.py
# @Software: PyCharm

# author dengguo
import socket, sys, time, queue, re, http
import selectors
from WSGI_Web_app import Application


class WSGIserver(object):
    def __init__(self, host, status):
        self.form_data = []
        self.status = status
        self.host = host
        self.set_headers = []
        self.data_queue = data_queue = queue.Queue()
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.bind((host, post))
        self.socket.listen(10)
        sel = selectors.DefaultSelector()

    def set_application(self, application):
        self.application = application

    def get_conn(self, host, post):
        while True:
            try:
                self.client_conn, addr = self.socket.accept()
                self.register(self.client_conn, selectors.EVENT_READ, self.handle_request())
            except (ConnectionError, ConnectionResetError) as e:
                print(e)

    def parse_request(self, request_msg):
        request_line = request_msg.splitlines()[0]
        request_line = request_line.rstrip('\r\n')
        (self.request_method,
         self.path,
         self.request_version
         ) = request_line.split()

    def handle_request(self):
        self.get_request = self.client_conn.recv(bufsize=1024)
        self.data_queue.put(self.get_request)
        if self.data_queue != None:
            data = self.data_queue.get()
            if self.method == "GET":
                if re.findall(r'/.*\.(?:(?!(jpg|css|js|html|htm|png)).)+/ ', self.path) != None:
                    with open(self.path, 'rb') as f:
                        cont_body = f.read().replace('\n', '')
                        cont_body.encode('base64')
                        response = '''HTTP/1.1 200 OK
                                    Server: %s
                                    Date: %s
                                    Expires: %s
                                    Content-Type: text/html;charset=utf8
                                    Content-Length: %s
                                    Connection: keep-alive

                                    %s''' % (
                            socket.gethostbyname(),
                            time.ctime(),
                            time.ctime(3333333333),
                            len(cont_body),
                            cont_body
                        )
                        self.client_conn.sendall(response)
                        self.client_conn.close()
                else:
                    cont_body = "404 NOT FOUND"
                    response = response = '''HTTP/1.1 200 OK
                                    Server: %s
                                    Date: %s
                                    Expires: %s
                                    Content-Type: text/html;charset=utf8
                                    Content-Length: %s
                                    Connection: keep-alive

                                    %s''' % (
                        socket.gethostbyname(),
                        time.ctime(),
                        time.ctime(3333333333),
                        len(cont_body),
                        cont_body)
            else:
                self.parse_request(data)
                reg = r'\r\n\r\n(.+)'
                pattern = re.compile(reg)
                form_data = re.search(pattern, http.decode())
                self.form_data = form_data
                env = self.get_environ()
                get_application = self.application(env, self.start_response)
                self.finish_response(get_application)
        self.unregister(self.client_conn)

    def get_environ(self):
        env = {}
        env['wsgi.version'] = (1, 0)
        env['wsgi.url_scheme'] = 'http'
        env['REQUEST_METHOD'] = self.request_method
        env['PATH_INFO'] = self.path
        env['query_string'] = self.form_data
        env['SERVER_PORT'] = str(post)
        return env

    def start_response(self, status, response_headers, exc_info=None):
        headers = [('date: ', time.ctime()), ('Server: ', socket.gethostbyname())]
        self.set_headers = [status, (headers, response_headers)]

    def finish_response(self, get_request):
        try:
            response = 'HTTP/1.1 {status}\r\n'.format(status=self.status)
            for header in self.set_headers:
                response += '{0}: {1}\r\n'.format(*header)
                response += '\r\n'
                for data in self.get_request:
                    response += data
            self.client_conn.sendall(response)
            self.client_conn.close()
        except Exception as e:
            print(e)


if __name__ == '__main__':
    address = ('', 8005)


    def make_server(address, application):
        myserver = WSGIserver(address)
        # myserver.set_application(application)
        return myserver


    host, post = address
    set_connection = make_server(address, Application)
    set_connection.get_conn(host, post)
