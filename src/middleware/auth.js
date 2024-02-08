//Middlewares ------------------------

export function sessionActive(req, res, next){
    if(req.session?.user) return res.redirect('/products')
    return next()
}

export function auth(req, res, next){
    if(req.session?.user) return next()

    res.redirect('/login')
}