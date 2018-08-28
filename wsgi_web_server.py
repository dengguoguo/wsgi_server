#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# @Author : dengguo
# @Time : 18-1-3 下午11:09
# @File : wsgi_web_server.py
# @Software: PyCharm
import socket
import sys
import time


class WSGIserver():
    address_family = socket.AF_INET
    socket_type = socket.SOCK_STREAM
    request_queue_size = 1

    def __init__(self, server_address):
        self.sock = socket.socket(self.address_family,
                                  self.socket_type)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(server_address)
        self.sock.listen(self.request_queue_size)
        host, port = self.sock.getsockname()[:2]
        self.server_name = host
        self.server_port = port
        self.form_data = []
        self.set_headers = []

    def set_application(self, application):
        self.application = application

    def get_conn(self):
        server_sock = self.sock
        while True:
            self.client_connection, client_address = server_sock.accept()
            self.handle_request()

    def handle_request(self):
        self.request_data = request_data = self.client_connection.recv(1024).decode()
        self.parse_request(request_data)
        env = self.get_environ()
        result = self.application(env, self.start_response)
        self.finish_response(result)

    def parse_request(self, request_msg):
        request_line = request_msg.splitlines()[0]
        print('>>>>>>', request_line)
        request_line = request_line.rstrip('\r\n')
        (self.request_method,
         self.path,
         self.request_version
         ) = request_line.split()

    def get_environ(self):
        env = {}
        env['wsgi.version'] = (1, 0)
        env['wsgi.url_scheme'] = 'http'
        env['wsgi.errors'] = sys.stderr
        env['wsgi.multithread'] = False
        env['wsgi.multiprocess'] = False
        env['wsgi.run_once'] = False
        env['wsgi.errors'] = sys.stderr
        env['query_string'] = self.form_data
        env['SERVER_PORT'] = str(self.server_port)
        env['REQUEST_METHOD'] = self.request_method
        env['PATH_INFO'] = self.path
        env['SERVER_NAME'] = self.server_name
        return env

    def start_response(self, status, response_headers, exc_info=None):
        headers = [('date: ', time.ctime()),
                   ('Server', self.server_name)]
        self.set_headers = [status, headers + response_headers]

    def finish_response(self, result):
        try:
            status, response_headers = self.set_headers
            response = 'HTTP/1.1 {status}\r\n'.format(status=status)
            for header in self.set_headers:
                response += '{0}: {1}\r\n'.format(*header)
                response += '\r\n'
                for data in result:
                    response += data.decode()
            self.client_connection.sendall(response.encode())
        finally:
            self.client_connection.close()



server_address = ('127.0.0.1', 8000)

def make_server(address, application):
    server = WSGIserver(address)
    server.set_application(application)
    return server

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit("no command")
    app_path = sys.argv[1]
    module, application = app_path.split(":")
    print(application, module)
    module = __import__(module)
    application = getattr(module, application)
    httpd = make_server(server_address, application)
    print("WSGI server is runing")
    httpd.get_conn()


