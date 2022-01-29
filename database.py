import os
import pandas as pd

class Database:

    USER_COLUMNS =  ("username", "hashed_password", "salt", "public_key", "session_id", "expiration_session_id")
    MESSAGE_COLUMNS = ("sendername", "destname", "message_text", "timestamp")    

    def get_users_table(self):
        raise NotImplementedError()

    def get_messages_table(self):
        raise NotImplementedError()

    def save_table(self, dataframe):
        raise NotImplementedError()


class CsvDatabase(Database):

    def __init__(self, root_dir):
        self.__ROOT_DIR = root_dir
        self.__USERS_PATH = self.__ROOT_DIR+"/users.csv"
        self.__MESSAGE_PATH = self.__ROOT_DIR+"/messages.csv"
    
    def get_users_table(self):
        
        if not os.path.isfile(self.__USERS_PATH):
             with open(self.__USERS_PATH, "w+"): pass
             df = pd.DataFrame( [], columns=Database.USER_COLUMNS )
             df.to_csv(self.__USERS_PATH, index=False) 
    
        return pd.read_csv(self.__USERS_PATH)


    def get_messages_table(self):
        
        if not os.path.isfile(self.__MESSAGE_PATH):
             with open(self.__MESSAGE_PATH, "w+"): pass
             df = pd.DataFrame( [], columns=Database.MESSAGE_COLUMNS )
             df.to_csv(self.__MESSAGE_PATH, index=False) 
    
        return pd.read_csv(self.__MESSAGE_PATH)


    def save_table(self, dataframe):

        columns = tuple(dataframe.columns)

        if columns==Database.USER_COLUMNS:
            dataframe.to_csv(self.__USERS_PATH, index=False)
            return
        if columns==Database.MESSAGE_COLUMNS:
            dataframe.to_csv(self.__MESSAGE_PATH, index=False)
            return

        raise Exception(f"{dataframe} has an invalid schema!!!!!")
            





