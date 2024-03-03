import os
from mutagen.mp3 import MP3, HeaderNotFoundError
import psycopg2
from datetime import datetime
from tqdm import tqdm


def connect_to_postgres():
    conn = psycopg2.connect(
        dbname="mp3_database",
        user="ravi",
        password="ravi",
        host="localhost",
        port="5432"
    )
    return conn

def fetch_mp3_metadata(file_path):
    try:
        audio = MP3(file_path, ID3=MP3.ID3)
    except HeaderNotFoundError:
        print(f"Error: HeaderNotFoundError occurred while processing file: {file_path}")
        return {
            'file_name': os.path.basename(file_path),
            'file_path': file_path,
            'title': os.path.basename(file_path),  # Use the file name as title
            'artist': None,  # Set artist to None
            'album': None,  # Set album to None
            'genre': None,  # Set genre to None
            'track_number': None,  # Set track number to None
            'year': None,  # Set year to None
            'duration': None  # Set duration to None
        }
    return {
        'file_name': os.path.basename(file_path),
        'file_path': file_path,
        'title': audio.get('TIT2', [''])[0] or os.path.basename(file_path),
        'artist': audio.get('TPE1', [''])[0] or None,
        'album': audio.get('TALB', [''])[0] or None,
        'genre': audio.get('TCON', [''])[0] or None,
        'track_number': 1,
        'year': str(audio.get('TDRC', [''])[0]) or None,
        'duration': audio.info.length
    }

def insert_metadata(conn, metadata):
    sql = """INSERT INTO mp3_files (file_name, file_path, title, artist, album, genre, track_number, year, duration)
             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    cur = conn.cursor()
    cur.execute(sql, (metadata['file_name'], metadata['file_path'], metadata['title'], metadata['artist'], 
                      metadata['album'], metadata['genre'], metadata['track_number'], metadata['year'], metadata['duration']))
    conn.commit()
    cur.close()

def main(directory):
    conn = connect_to_postgres()
    for root, dirs, files in os.walk(directory):
        for file in tqdm(files):
            if file.endswith('.mp3'):
                file_path = os.path.join(root, file)
                metadata = fetch_mp3_metadata(file_path)
                insert_metadata(conn, metadata)

                # if metadata is not None:
                #     insert_metadata(conn, metadata)
                # else:
                #     print(f"Skipping file: {file_path} due to HeaderNotFoundError")
    conn.close()
    conn.close()

if __name__ == "__main__":
    main(r"/Users/ravi/Music")
