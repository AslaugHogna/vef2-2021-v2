Búa þarf til postgresql gagnagrunn og setja tengistreng í skrá sem heitir .env (búa þarf þess skrá til). Sjá dæmi í .env_example.

Keyrt með:

* `npm install` keyrt fyrst sem sækir öll dependency
* `npm run setup`, keyrir setup á gagnagrunn (sjá að neðan)
* `npm start` keyrir upp express vefþjón á porti `3000`
* `npm test` keyrir eslint og stylelint

npm run setup hendir töflunni signatures, býr hana til skv. schema.sql og setur inn gögn í fake.sql.