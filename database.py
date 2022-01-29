import os
import pandas as pd
from sqlalchemy import create_engine
import pymysql
import pandas as pd


class Database:

    USER_COLUMNS =  ("username", "hashed_password", "salt", "public_key", "session_id", "expiration_session_id")
    MESSAGE_COLUMNS = ( "sendername", "destname", "message_text", "timestamp")    

    def get_users_table(self):
        raise NotImplementedError()

    def get_messages_table(self):
        raise NotImplementedError()

    def save_table(self, dataframe):
        raise NotImplementedError()


class CsvDatabase(Database):

    """
    Csv file-based implementation of the Database. 
    For testing purposes.
    """

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

        raise Exception(f"dataframe {columns} has an invalid schema!!!!!")
            






class SqlDatabase(Database):


    """
    Sql-based implementation of the Database. 
    """

    def __init__(self, connection_string):
        self.connection_string = connection_string # specifies schema
        

    def get_messages_table(self):
        try:
            sqlEngine = create_engine( self.connection_string, pool_recycle=3600)
            dbConnection = sqlEngine.connect()
            df = pd.read_sql("select * from MESSAGES", dbConnection)
            dbConnection.close()
            return df.drop(columns=["index"])
        except:
            # create table if it doesn't exist
            df = pd.DataFrame([], columns=Database.MESSAGE_COLUMNS)
            self.save_table(df)
            return df


    def get_users_table(self):

        try:
            sqlEngine = create_engine( self.connection_string, pool_recycle=3600)
            dbConnection = sqlEngine.connect()
            df = pd.read_sql("select * from USERS", dbConnection)
            dbConnection.close()
            return df.drop(columns=["index"])
        except:
            # create table if it doesn't exist
            df = pd.DataFrame([], columns=Database.USER_COLUMNS)
            print("just created users table", tuple(df.columns))
            self.save_table(df)
            return df


    def save_table(self, dataframe):
        sqlEngine = create_engine( self.connection_string, pool_recycle=3600)
        dbConnection = sqlEngine.connect()
        
        columns = tuple(dataframe.columns)

        if columns==Database.USER_COLUMNS:
            dataframe.to_sql("USERS", dbConnection, if_exists='replace')
            return
        if columns==Database.MESSAGE_COLUMNS:
            dataframe.to_sql("MESSAGES", dbConnection, if_exists='replace')
            return
        
        raise Exception(f"dataframe {columns} has an invalid schema!!!!!")

        





