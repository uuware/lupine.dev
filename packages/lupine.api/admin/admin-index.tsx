import { DomUtils, PageProps, PageRouter, Redirect } from 'lupine.web';
import { AdminFrame } from './admin-frame';
import { AdminLoginPage } from './admin-login';
import { AdminMenuSinglePage } from './admin-menu-list';
import { AdminDesignPage } from './design/admin-design';

const fetchAuth = async (props: PageProps) => {
  const data = await props.renderPageFunctions.fetchData('/api/admin/auth');
  return data.json;
};

export const checkAuth = async (props: PageProps) => {
  if (typeof document === 'undefined') {
    // no ssr for admin pages
    return await BlankPage(props);
  }

  const json = await fetchAuth(props);
  console.log('======auth', json);
  if ((typeof json === 'undefined' || !json.result) && props.url !== '/admin_dev/login') {
    return Redirect({ url: '/admin_dev/login' });
  }
  return null;
};

// export const bindAdmin = async (props: PageProps) => {
//   MetaData({ name: 'robots', content: 'noindex, nofollow' });

//   if (typeof document === 'undefined') {
//     // no ssr for admin pages
//     return await BlankPage(props);
//   }

//   const json = await fetchAuth(props);
//   console.log('======auth', json);
//   if ((typeof json === 'undefined' || !json.result) && props.url !== '/admin_dev/login') {
//     return Redirect({ url: '/admin_dev/login' });
//   }

//   if (props.urlSections[1] === 'login') {
//     if (json && json.result) {
//       return Redirect({ url: '/admin_dev' });
//     }
//     return await AdminLoginPage(props);
//   }

//   return await AdminIndexPage(props);
// };

export const AdminIndexPage = async (props: PageProps) => {
  const onClick = () => {
    DomUtils.clearCookie('_token_dev', '/');
    window.location.href = '/admin_dev';
  };
  return (
    <AdminFrame title='Welcome...'>
      <div class='admin-sub-title'>Admin Console</div>
      <div class='row-box'>
        <button onClick={onClick} class='button-base'>
          Logout
        </button>
      </div>
    </AdminFrame>
  );
};

export const BlankPage = async (props: PageProps) => {
  return <div></div>;
};

const devAdminPageRouter = new PageRouter();
devAdminPageRouter.setFilter(checkAuth);

devAdminPageRouter.use('/menu', AdminMenuSinglePage);
devAdminPageRouter.use('/design', AdminDesignPage);
devAdminPageRouter.use('/login', AdminLoginPage);
devAdminPageRouter.use('/*', AdminIndexPage);

export { devAdminPageRouter };
