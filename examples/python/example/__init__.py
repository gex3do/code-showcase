import os


def read_file(filename: str) -> str:
    """
    Read file and returns contents.

    :param filename: file name
    :return: file contents

    :raise OSError: Runtime error
    """
    curr_dir = os.path.dirname(__file__)
    with open(os.path.join(curr_dir, filename), "r") as fp:
        return fp.read().strip()
