import { Logger } from '../logger';

describe('Test logger', () => {
  var db: any;
  beforeEach(() => {
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database(':memory:');
  });

  it('test init without recreating a file', (done) => {
    db.serialize(() => {
      db.run('CREATE TABLE lorem (info TEXT)');

      const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
      for (let i = 0; i < 10; i++) {
        stmt.run('Ipsum ' + i);
      }
      stmt.finalize();

      db.each('SELECT rowid AS id, info FROM lorem', (err: any, row: any) => {
        console.log(row.id + ': ' + row.info);
      });
    });

    db.wait(done);
    db.close();
  });
});
