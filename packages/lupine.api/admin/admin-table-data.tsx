import {
  CssProps,
  HtmlVar,
  PagingLink,
  RefProps,
  bindGlobalStyles,
  getDefaultPageLimit,
  getRenderPageProps,
} from 'lupine.web';

const loadData = async (
  onLinkClick: (index: number) => Promise<void>,
  index: number,
  tableName: string,
  update?: TableDataUpdateProps
) => {
  // this is only executed in the FE
  const pageIndex = index ?? getRenderPageProps().query['pg_i'];
  const pageLimit = getRenderPageProps().query['pg_l'] || getDefaultPageLimit();
  const data = await getRenderPageProps().renderPageFunctions.fetchData(
    `/api/admin/db/table/data/${tableName}/${pageIndex}/${pageLimit}`
  );
  const pageLink = (
    <PagingLink
      itemsCount={data && data.json && data.json.itemsCount}
      pageIndex={data && data.json && data.json.pageIndex}
      baseLink=''
      onClick={onLinkClick}
    ></PagingLink>
  );
  return data && data.json && data.json.result && data.json.result.length > 0 ? (
    <div class='table-box-outer'>
      {pageLink}
      <div class='table-box'>
        <div class='fields bg-gray'></div>
        <div class='table'>
          <div class='fields bg-gray'>
            {Object.keys(data.json.result[0]).map((field: any, index: number) => {
              return <div class='p1 item'>{field}</div>;
            })}
            {update && update.onDelete && update.onEdit && <div class='p1 item'>Action</div>}
          </div>

          {data.json.result.map((item: any) => {
            return (
              <div class='values'>
                {Object.keys(item).map((field: any, index: number) => {
                  return <div class='p1 item'>{item[field]}</div>;
                })}
                {update && update.onDelete && update.onEdit && (
                  <div class='p1 item'>
                    <button
                      class='button-base button-s'
                      onClick={() => {
                        update.onEdit!(item);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      class='button-base button-s'
                      onClick={() => {
                        update.onDelete!(item);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {pageLink}
    </div>
  ) : (
    <div>{pageLink}No data.</div>
  );
};

export type TableDataUpdateProps = {
  refreshRef?: Function;
  onDelete?: Function;
  onEdit?: Function;
};
export const AdminTableData = (props: { tableName: string; update?: TableDataUpdateProps }) => {
  const css: CssProps = {
    '.table-box': {
      overflowX: 'auto',
    },
    '.table': {
      borderCollapse: 'collapse',
      display: 'table',
    },
    '.table-box .fields, .table-box .values': {
      display: 'table-row',
    },
    '.table-box .fields .item, .table-box .values .item': {
      display: 'table-cell',
      border: 'solid 1px gray',
    },
  };

  const onPageClick = async (index: number) => {
    console.log('onPageClick', index);
    dom.value = await loadData(onPageClick, index, props.tableName, props.update);
  };
  const refresh = async () => {
    dom.value = await loadData(onPageClick, 0, props.tableName, props.update);
    // mountComponents(ref.current, dom);
  };
  const ref: RefProps = {
    onLoad: async () => {
      // const self = ref.current;
      dom.value = await loadData(onPageClick, 0, props.tableName, props.update);
      // mountComponents(self, dom);
    },
  };
  if (props.update) {
    props.update.refreshRef = refresh;
  }
  bindGlobalStyles('admin-table-data', '.admin-table-data', css);
  const dom = HtmlVar('');
  return (
    <div className='admin-table-data' ref={ref}>
      {dom.node}
    </div>
  );
};

export const TableDataPage = (tableName: string) => {
  return (
    <div>
      table: {tableName}
      <AdminTableData tableName={tableName}></AdminTableData>
    </div>
  );
};
