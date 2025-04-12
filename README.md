# lupine.dev

This repo is used for development of LupineJs and LupineApi.
It contains LupineJs and LupineApi source code as separate repos, and the environment to build and run them.

# How to start

1, clone this repo locally

```
git clone https://github.com/uuware/lupine.dev.git
```

And add packages (goto the `Add packages after clone this repo (first time only)` section)


2, install dependencies

```
npm i
```

## use the sample script in .env file to generate the keys for those variables:
```
ADMIN_PASS=
CRYPTO_KEY=
DEV_ADMIN_PASS=
DEV_CRYPTO_KEY=
```

## follow the link in .env file to set gamil account to send email (if you use email registration)
```
SEND_EMAIL_USER=
SEND_EMAIL_PASS=
```


3, run the development application

```
npm run dev
```

4, now you can open http://localhost:11080 to see the development application


# How to debug

1, Debug the backend only:
Open a Javascript Debug Terminal and run `npm run dev`.

2, Debug the frontend and backend:
At the Debug side bar of VS Code, click on the Run and Debug dropdown and select "LupineJS: Frontend & Backend".
Then you can set breakpoints in the FE or BE code and start debugging.

# How to generate self-signed ssl certificate for local SSL

https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-certificate-for-localhost-for-use-with-expre

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout cert.key -out cert.pem -sha256
On windows:
"C:\Program Files\Git\usr\bin\openssl.exe"

# How to add a new app?
Lupine app can run multiple apps under the same port. For local development, you can add a new app by following these steps:

1, Copy any apps under `/apps` to get a new app, change the folder name to the new app name, and the names in `apps\<your-app>\lupine.json`
2, Add the new app to `APPS=` in `.env` file
3, Add the new app's virtual domain to `DOMAINS@[APP-NAME]=` in `.env` file
4, The new app's FE and BE source will be built to `dist\server_root` folder
5, To access the new app in local from the same port, you need to set a virtual domain.
Go to the `Add local virtual domain for local development on a same port` section.

# Regarding FE global variables in SSR
Because it's Server Side Rendering, so the global variables in the FE code are shared by all users.
So the global variables should be used carefully.
So the following code will cause problem that, once the cacheUser is created, it will be shared by all users.
```
const cacheUser: { user: null | Promise<UserInfoType | null> } = { user: null };
export const getUserInfo = (refresh?: boolean): Promise<UserInfoType | null> => {
  if (!cacheUser.user || refresh) {
    cacheUser.user = new Promise(async (resolve, reject) => {
        ...
    });
  }
  return cacheUser.user;
};
```
The proper way to use global variables is to set the value in a onLoad event of a dom.
As the onLoad event only happens in the FE.
```
const cacheUser: { user: null | Promise<UserInfoType | null> } = { user: null };
export const UserInfo = (props?: any) => {
  const ref: RefProps = {
    onLoad: async () => {
      cacheUser.user = ...
    },
  };
  return (
    <div css={css} class='user-info-box' ref={ref}>
      ...
    </div>
  );
};
```


# Add packages after clone this repo (first time only)

## Nested repo in VS Code
For VS Code to detect nested repo under packages, you need to open Preferences > Settings, search `Repository`, and under `Git: Repository Scan Max Depth`, set it to `2`.

## Add lupine.js and lupine.api packages
As VS Code is good to manage separate packages, so we don't use git subtree or submodule.
Under packages folder, pull two packages (only once):
```
git clone https://github.com/uuware/lupine.js.git
git clone https://github.com/uuware/lupine.api.git
```

Once it's cloned, you may need to make some changes to three `.git\config` files under the project's root folder and `packages` folder. So that you can commit your code with correct permission and username.
## 1, Find your github access token from [Developer Settings / Personal access tokens (classic)](https://github.com/settings/tokens)

```
[remote "origin"]
	url = https://<your-github-access-token>@github.com/uuware/lupine.dev.git

[user]
	name = uuware
	email = uuware@gmail.com
```

# Add local virtual domain for local development on a same port
In order to access multiple apps on a same port, you need to add virtual domains in the hosts file.
For example if you want to access app1 from app1.sample-domain.com, you need to add this line to the hosts file:

```
127.0.0.1 app1.sample-domain.com
```
On Linux or macOS, the hosts file is located at:

```
/etc/hosts
```
On Windows OS, the hosts file is located at:

```
C:\Windows\System32\Drivers\etc\hosts
```
You may need proper permission to edit it.


# How to make a sub-folder (app) ?
Make a folder in apps's src folder, for example, `admin_dev`.

```
apps\[your-app-name]\web\src\admin_dev
```

And add `index.html` and `index.tsx` in the folder.
In `index.html`, it should load the `index.js` file in absolute path:

```
<script defer src="/admin_dev/index.js#t={hash}"></script>
```

In `apps\[your-app-name]\lupine.json`, add the following code to `entryPoints`:

```
    {
      "index": "web/src/admin_dev/index.tsx",
      "html": "web/src/admin_dev/index.html",
      "outdir": "/admin_dev"
    }

```

# How to check Code frequency (steps)
https://api.github.com/repos/uuware/lupine.dev/languages
Or
Github -> Code -> Insights -> Code frequency