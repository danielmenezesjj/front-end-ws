// ----------------------------------------------------------------------------
// AUTH0_CONFIG
//
// Informar configurações obtidas ao criar um client na plataforma Auth0.
// https://auth0.com/
// ----------------------------------------------------------------------------
var AUTH0_CONFIG = {
    domain: "dev-tucrycffbi28s1hi.us.auth0.com", // <-- TODO informar "domain"
    clientId: "0h4YeH8lJltgGrjeafaAgOl0LP06vof2", // <-- TODO informar "clientId"
    cacheLocation: "localstorage",
    useRefreshTokens: true
}


function getAuth0Client() {
    if (window.auth0Client) return Promise.resolve(window.auth0Client)
    return auth0
        .createAuth0Client(AUTH0_CONFIG)
        .then(function (client) {
            window.auth0Client = client
            return client
        })
}



function login() {
    var options = {
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    }
    getAuth0Client()
        .then(function (auth0Client) {
            return auth0Client.loginWithRedirect(options)
        })
        .catch(function (error) {
            console.log("login failed:", error)
        })
}



function logout() {
    var options = {
        logoutParams: {
            returnTo: window.location.origin
        }
    }
    getAuth0Client()
        .then(function (auth0Client) {
            return auth0Client.logout(options)
        })
        .catch(function (error) {
            console.log("logout failed:", error)
        })
}



function handleRedirectCallback() {
    var query = window.location.search
    var isRedirect = query.includes("code=") && query.includes("state=")
    if (!isRedirect) return Promise.resolve()
    return getAuth0Client().then(function (auth0Client) {
        return auth0Client.handleRedirectCallback()
    })
}


function getUser() {
    return getAuth0Client()
        .then(function (auth0Client) { return auth0Client.getUser() })
}



function isAuthenticated() {
    return getAuth0Client()
        .then(function (auth0Client) { return auth0Client.isAuthenticated() })
}



function getJwt() {
    return getAuth0Client()
        .then(function (auth0Client) { return Promise.all([auth0Client, auth0Client.getIdTokenClaims()]) })
        .then(function (res) {
            var auth0Client = res[0]
            var claims = res[1]
            var isTokenExpired = Date.now() > (claims.exp * 1000)
            return Promise.all([auth0Client, isTokenExpired && auth0Client.getTokenSilently({ cacheMode: "off" })])
        })
        .then(function (res) {
            var auth0Client = res[0]
            return auth0Client.getIdTokenClaims()
        })
        .then(function (claims) { return claims.__raw })
}