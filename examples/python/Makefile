setup:
	python3 -m venv venv
	source venv/bin/activate
	pip3 install -e .[dev]

start-server:
	python3 main.py --mode server

start-imap:
	python3 main.py --mode imap

check:
	isort -c **/*.py
	pylama -o pylama.ini **/*.py
