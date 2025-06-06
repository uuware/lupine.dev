import { CssProps } from '../jsx';
import { bindGlobalStyles, getRenderPageProps } from '../core';

let _DEFAULT_PAGE_LIMIT = 7;
export const getDefaultPageLimit = () => {
  return _DEFAULT_PAGE_LIMIT;
};
export const setDefaultPageLimit = (limit: number) => {
  _DEFAULT_PAGE_LIMIT = limit;
};
export type PagingLinkProps = {
  itemsCount: number;
  pageLimit?: number;
  pageIndex?: number;
  baseLink: string;
  onClick?: (index: number) => void; // if onClick is set then use it instead of href
};

export const PagingLink = (props: PagingLinkProps) => {
  const css: CssProps = {
    textAlign: 'right',
    paddingRight: '16px',
    '.paging-link-index': {
      padding: '0px 4px',
    },
    a: {
      textDecoration: 'none',
    },
  };

  bindGlobalStyles('paging-link-box', '.paging-link-box', css);
  const html = [];
  let pageIndex = props.pageIndex ?? (Number.parseInt(getRenderPageProps().query['pg_i'] || '') || 0);
  const pageLimit = props.pageLimit || _DEFAULT_PAGE_LIMIT;
  if (props.itemsCount > 0 && pageLimit > 0) {
    let maxPages = Math.floor(props.itemsCount / pageLimit);
    if (props.itemsCount % pageLimit !== 0) {
      maxPages++;
    }
    if (pageIndex > maxPages) {
      pageIndex = maxPages - 1;
    }
    if (pageIndex > 0) {
      html.push(
        <span class='paging-link-go'>
          <a
            href={props.onClick ? 'javascript:void(0)' : props.baseLink + '?pg_i=' + (pageIndex - 1)}
            onClick={() => props.onClick && props.onClick(pageIndex - 1)}
          >
            &lt;
          </a>
        </span>
      );
    } else {
      html.push(<span class='paging-link-go disabled'>&lt;</span>);
    }
    for (let i = 0; i < maxPages; i++) {
      if (i < 2 || i >= maxPages - 2 || (i > pageIndex - 3 && i < pageIndex + 3)) {
        if (i == pageIndex) {
          html.push(
            <span class='paging-link-index current'>
              <b>{'' + (i + 1)}</b>
            </span>
          );
        } else {
          html.push(
            <span class='paging-link-index'>
              <a
                href={props.onClick ? 'javascript:void(0)' : props.baseLink + '?pg_i=' + i}
                onClick={() => props.onClick && props.onClick(i)}
              >
                {'' + (i + 1)}
              </a>
            </span>
          );
        }
      } else {
        if (i == pageIndex - 4 || i == pageIndex + 4) {
          html.push(<span class='paging-link-skip'>...</span>);
        }
      }
    }
    if (pageIndex < maxPages - 1) {
      html.push(
        <span class='paging-link-go'>
          <a
            href={props.onClick ? 'javascript:void(0)' : props.baseLink + '?pg_i=' + (pageIndex + 1)}
            onClick={() => props.onClick && props.onClick(pageIndex + 1)}
          >
            &gt;
          </a>
        </span>
      );
    } else {
      html.push(<span class='paging-link-go disabled'>&gt;</span>);
    }
  }

  return html.length > 0 ? <div class='paging-link-box'>{html}</div> : <></>;
};
