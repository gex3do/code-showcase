import textwrap

from example import read_file
from setuptools import find_packages, setup


ver = read_file("../VERSION")

setup(
    name="example-project",
    version=ver,
    description=textwrap.dedent(
        """
        This is just an example project
        """
    ),
    url="https://myproject.notexisting.com",
    author="Dmitry Sagoyan",
    author_email="contact@myproject.notexisting.com",
    keywords=["example"],
    setup_requires=["setuptools~=70.1.0", "wheel~=0.42.0"],
    python_requires=">=3.9, <4",
    install_requires=[
        "fastapi",
        "requests",
        "pydantic",
        "pydantic-settings",
        "pytz",
        "validate_email",
        "uvicorn",
    ],
    extras_require={
        "dev": ["isort"],
        "test": ["pylama", "pytest", "mock"],
    },
    packages=find_packages(),
    package_dir={"myproject": "example"},
    project_urls={"Promotion Site": "https://myproject.notexisting.com"},
)
