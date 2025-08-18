import logging
import os
from datetime import datetime

def setup_logger():
    """Setup logger configuration for the application."""
    # Create logs directory if it doesn't exist
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Create a logger
    logger = logging.getLogger('innolab')
    logger.setLevel(logging.INFO)

    # Create handlers
    console_handler = logging.StreamHandler()
    # Create unique log file for each run with timestamp
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    file_handler = logging.FileHandler(f'logs/innolab_{timestamp}.log')

    # Create formatters and add it to handlers
    log_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(log_format)
    file_handler.setFormatter(log_format)

    # Add handlers to the logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger

logger = setup_logger()
