beforeEach(() => {
  cy.visit('/')

  cy.intercept('POST','https://run.mocky.io/v3/b08050cb-14d8-44b2-a8ab-a366ecead596').as('logIn')

  cy.intercept('POST','https://run.mocky.io/v3/5cc28ca6-1e6c-4a34-91a8-2c0d7f24e299').as('logInUnsuccessful')
});

before(() => {
  cy.fixture('codibly').then((fixture) => {
  this.data = fixture;
  });
});

describe('Fill up the form', () => {
  it('Enter Correct E-mail and correct Password', () => {
    cy.get('input[name=email]').first().type(this.data.email)
    cy.get('input[name=password]').first().type(this.data.password)
    cy.get('button[type=submit]').contains('Log in').click()

    cy.wait('@logIn').then((interception) => {
      expect(interception.response).property('statusCode').to.equal(200)
      expect(interception.response.body).to.have.property('token')
    })

    cy.get('div[data-testid=app__login-section]').contains('Successfuly logged in').should('be.visible')
  })

  it('Enter Incorrect E-mail and good password', () => {
    cy.get('input[name=email]').first().type(this.data.incorrectEmail)
    cy.get('input[name=password]').first().type(this.data.password)

    cy.get('.Mui-error').contains('Please provide correct email address').should('be.visible')
  })

  it('Enter Incorrect E-mail and incorrect password - missing number', () => {
    cy.get('input[name=email]').first().type(this.data.incorrectEmail)
    cy.get('input[name=password]').first().type(this.data.incorrectPasswordMissingNumber)

    cy.get('.Mui-error').contains('Please provide correct email address').should('be.visible')
    cy.get('.Mui-error').contains('Password should contain a number').should('be.visible')
  })

  it('Enter Incorrect E-mail and incorrect password - too short', () => {
    cy.get('input[name=email]').first().type(this.data.incorrectEmail)
    cy.get('input[name=password]').first().type(this.data.incorrectPasswordTooShort)

    cy.get('.Mui-error').contains('Please provide correct email address').should('be.visible')
    cy.get('.Mui-error').contains('Password should contain at least 10 characters').should('be.visible')
  })

  it('Enter Correct E-mail and incorrect password - too short', () => {
    cy.get('input[name=email]').first().type(this.data.email)
    cy.get('input[name=password]').first().type(this.data.incorrectPasswordTooShort)

    cy.get('.Mui-error').contains('Please provide correct email address').should('not.exist')
    cy.get('.Mui-error').contains('Password should contain at least 10 characters').should('be.visible')
  })

  it('Enter Correct E-mail and correct password with Active Checkbox "Should Response be unsuccessfull"', () => {
    cy.get('input[name=email]').first().type(this.data.email)
    cy.get('input[name=password]').first().type(this.data.password)

    cy.get('input[name="shouldFail"').first().check()
    cy.get('button[type=submit]').contains('Log in').click()


    cy.wait('@logInUnsuccessful').then((interception) => {
      expect(interception.response).property('statusCode').to.equal(401)
      expect(interception.response.body).to.have.property('errorMessage')
      expect(interception.response.body.errorMessage).to.contain('Login failed: invalid username or password')
    })

    cy.get('div[data-testid=login-form__form-error]').contains('Login failed: invalid username or password').should('be.visible')
  })

  
})