module.exports = function (db) {

    return {
        requireAuthentication: function (req, res, next) {
            var token = req.get('Auth');
            console.log('-------------------------------');
            console.log('Auth: ' + token);

            db.user.findByToken(token).then(function (user) {
                console.log('user: ' + user);

                req.user = user;
                next();
            }, function () {
               res.status(401).send();
            });
        }
    };
}





// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IlUyRnNkR1ZrWDE5d3Q1cGIwQi9NQzdGTU1mRThXYzhqS0o1Q1liMk1Ma1p2M1NjdFlSV0k2a2l4c1M5ZTNscFNqTXc0ay9DNStNOHR0UXRyRXRTakRBPT0iLCJpYXQiOjE0NzY5NzQwNTl9.Kt86abQGOQHN2RrIf4iCDHm6foyZENLOYuxwKBNPHPM

// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IlUyRnNkR1ZrWDE4d1ZjeGJzNjRlMThkSVVndjR0QUdLbDR1bUhpK3cvZzJsZTJxajd2cm11eC84YW5qMktjejhjbXpmQ2RPTDYvaUk5d0diQy9OdE9RPT0iLCJpYXQiOjE0NzY5NzQ3NTZ9.TDAirQMJA4arfrynlknai4qCMTyJzy5V2WasHeBsPBs




// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IlUyRnNkR1ZrWDErV25hd2JTVy9LNEFvWHdkK0ducGwxemEyeE9UT0ZnbjQ5NkFxZnFCdkxtMGtTdHhJeEpNNFhsb1l5a2t6ZUt4S0M2TmQ5a3YxVkJBPT0iLCJpYXQiOjE0NzY5NzQ5MzF9.sOoa84WK-C74JNmUIe-T1Y3cMCuV26VNkXMAxyGwabw