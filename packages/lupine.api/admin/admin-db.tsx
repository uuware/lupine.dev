import { CssProps, getRenderPageProps, RefProps } from 'lupine.components';

const fetchCreateTables = async () => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData(`/api/admin/db/install`);
  return data.json;
};

export const CreateTablesPage = () => {
  const onClick = async () => {
    const json = await fetchCreateTables();
    console.log('====homepage', json);
    document.querySelector('.install-result')!.innerHTML = JSON.stringify(json.result, null, 4);
  };

  const css: CssProps = {
    '.install-result': {
      display: 'block',
      unicodeBidi: 'embed',
      fontFamily: 'monospace',
      whiteSpace: 'pre',
    },
  };
  const ref: RefProps = {};
  return (
    <div ref={ref} css={css}>
      Create Tables:
      <button onClick={onClick} class='button-base'>
        Start
      </button>
      <div class='install-result'></div>
    </div>
  );
};

const fetchRunSql = async (sql: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/run-sql', { sql });
  return data.json;
};

export const RunSqlPage = () => {
  const onClick = async () => {
    const json = await fetchRunSql((ref.$('.sql') as HTMLFormElement).value);
    console.log('====homepage', json);
    ref.$('.sql-result').innerHTML = JSON.stringify(json.result, null, 4);
  };

  const css: CssProps = {
    'textarea.sql': {
      width: '100%',
      height: '200px',
    },
    '.sql-result': {
      display: 'block',
      unicodeBidi: 'embed',
      fontFamily: 'monospace',
      whiteSpace: 'pre',
    },
  };
  const ref: RefProps = {};
  return (
    <div ref={ref} css={css}>
      <div>Run SQL:</div>
      <div>
        <textarea class='input-base sql'>SELECT 'Hello world'</textarea>
      </div>
      <div>
        <button onClick={onClick} class='button-base'>
          Run
        </button>
      </div>
      <div class='sql-result'></div>
    </div>
  );
};
