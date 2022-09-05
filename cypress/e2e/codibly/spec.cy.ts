beforeEach(() => {
  cy.visit('/')

});

before(() => {
  cy.fixture('codibly').then((fixture) => {
  this.data = fixture;
  });

  cy.intercept('POST','https://run.mocky.io/v3/b08050cb-14d8-44b2-a8ab-a366ecead596').as('logIn')
});


describe('Enter correct e-mail and correct password', () => {
  it('Successful Log in', () => {
    cy.get('input[name=email]').first().type(this.data.email)
    cy.get('input[name=password]').first().type(this.data.password)
    cy.get('button[type=submit]').contains('Log in').click()

    cy.wait('@logIn').then((interception) => {
      expect(interception.response).property('statusCode').to.equal(200)
      expect(interception.response.body).to.have.property('token')
    })

    cy.get('div[data-testid=app__login-section]').contains('Successfuly logged in').should('be.visible')
  })
})