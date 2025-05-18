#-- Auto Created By WebNoCoding at:2015-06-03 16:51:43
#-- Never name a table with plural (such as "users")
#-- Never name a table using a reserved keyword (such as "user")
#-- Never prefix your table name with "tbl" or some other object type prefix

CREATE TABLE $__s_page (
  pageid VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL DEFAULT '',
  note VARCHAR(250) NOT NULL DEFAULT '',
  package VARCHAR(20) NOT NULL DEFAULT '',
  items TEXT NOT NULL DEFAULT '',
  updateduserid INTEGER,
  updatedstamp VARCHAR(20),
  PRIMARY KEY (pageid)
);

CREATE TABLE $__s_menu (
  menuid VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL DEFAULT '',
  note VARCHAR(250) NOT NULL DEFAULT '',
  package VARCHAR(20) NOT NULL DEFAULT '',
  items TEXT NOT NULL DEFAULT '',
  updateduserid INTEGER,
  updatedstamp VARCHAR(20),
  PRIMARY KEY (menuid)
);

CREATE TABLE $__s_user (
    id INTEGER NOT NULL DEFAULT '0',
    gid INTEGER NOT NULL DEFAULT '1',
    level INTEGER NOT NULL DEFAULT '0',
    nickname VARCHAR(200) NOT NULL DEFAULT '',
    username VARCHAR(150) NOT NULL DEFAULT '',
    email VARCHAR(100) NOT NULL DEFAULT '',
    password VARCHAR(100) NOT NULL DEFAULT '',
    usertype VARCHAR(25) NOT NULL DEFAULT '',
    block CHAR(1) NOT NULL DEFAULT '0',
    sendemail CHAR(1) DEFAULT '0',
    gender VARCHAR(10) DEFAULT '0',
    age INTEGER NOT NULL DEFAULT '0',
    training INTEGER NOT NULL DEFAULT '0',
    preference VARCHAR(100) NOT NULL DEFAULT '',
    registerdate VARCHAR(20) NOT NULL DEFAULT '',
    lastvisitdate VARCHAR(20) NOT NULL DEFAULT '',
    activated CHAR(1) NOT NULL DEFAULT '0',
    activation VARCHAR(10) NOT NULL DEFAULT '',
    points INTEGER NOT NULL DEFAULT '0',
    pwtips VARCHAR(100) DEFAULT '',
    pwretry INTEGER NOT NULL DEFAULT '0',
    pwquestion VARCHAR(100) DEFAULT '',
    pwanswer VARCHAR(100) DEFAULT '',
    PRIMARY KEY (id)
);

#-- TABLE:$__st_calendar
CREATE TABLE $__s_calendar (
  calendarid VARCHAR(50) NOT NULL,
  title VARCHAR(250) NOT NULL DEFAULT '',
  published CHAR(1) NOT NULL DEFAULT '0',
  remark VARCHAR(250),
  monthfrom VARCHAR(6),
  monthto VARCHAR(6),
  bkcolor VARCHAR(7),
  cidstring VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (calendarid)
);

CREATE TABLE $__s_user_right (
  username VARCHAR(150) NOT NULL,
  rightsid VARCHAR(50) NOT NULL,
  rightsgroup VARCHAR(10) NOT NULL DEFAULT '',
  value TEXT NOT NULL,
  PRIMARY KEY (username, rightsid)
);

