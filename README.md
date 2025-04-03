# lupine.dev

This repo is used for development of LupineJs and LupineApi.
It contains LupineJs and LupineApi source code as separate repos, and the environment to build and run them.

# How to start

1, clone this repo locally

```
git clone https://github.com/uuware/lupine.dev.git
```

2, install dependencies

```
npm i
```

3, run the development application

```
npm run dev
```

## How to debug

1, Debug the backend only:
Open a Javascript Debug Terminal and run `npm run dev`.

2, Debug the frontend and backend:
At the Debug side bar of vs code, click on the Run and Debug dropdown and select "LupineJS: Frontend & Backend".
Then you can set breakpoints in the FE or BE code and start debugging.

# How to generate self-signed ssl certificate for local SSL

https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-certificate-for-localhost-for-use-with-expre

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout cert.key -out cert.pem -sha256
On windows:
"C:\Program Files\Git\usr\bin\openssl.exe"


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