/* globals cy */
const bid = '5f301c29-15ca-23c0-29e0-cda902eb09af';

// Initial state for empty bill.
const initialState = () => {
  // Check that loader is not visible.
  cy.get('#loader').should('not.be.visible');

  // Check that description is empty.
  cy.get('#description').should('have.value', '');

  // Check that page is showing one person.
  cy.get('.person').should('have.length', 1);

  // Check that person name, amount and total is empty.
  cy.get('.person').first().within(() => {
    cy.get('.person__name').should('have.value', '');
    cy.get('.person__amount').should('have.value', '');
    cy.get('.person__total').should('contain', '0 EUR');

    // Person delete button is not visible
    cy.get('.person__delete').should('not.exist');
  });

  // Buttons
  cy.get('#add').should('be.enabled');
  cy.get('#share').should('be.disabled');
  cy.get('#save').should('be.disabled');
  cy.get('#delete').should('not.exist');
};

describe('UI', () => {
  it('should render without any data', () => {
    cy.visit('/');

    // Check initial state.
    initialState();
  });

  it('should save new bill', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Set fetch to null so Cypress uses XHR for requests. Mocking fetch is not supported yet.
        win.fetch = null; // eslint-disable-line no-param-reassign
      }
    });

    // Check initial state.
    initialState();

    // Set bill description and check that page title matches
    cy.get('#description').type('example bill');
    cy.title().should('eq', 'YABSA - example bill');

    // Set 1st person data
    cy.get('.person').first().within(() => {
      cy.get('.person__name').type('bob');
      cy.get('.person__amount').type(10);
      cy.get('.person__total').should('contain', '10 EUR');
    });

    // Add person
    cy.get('#add').click();
    cy.get('.person').should('have.length', 2);

    cy.get('.person').first().next().within(() => {
      cy.get('.person__name').type('mary');
      cy.get('.person__amount').type(20);
      cy.get('.person__total').should('contain', '20 EUR');
      cy.get('.person__delete').should('exist');
    });

    // Buttons
    cy.get('#add').should('be.enabled');
    cy.get('#share').should('be.enabled');
    cy.get('#save').should('be.enabled');
    cy.get('#delete').should('not.exist');

    // Share expenses
    cy.get('#share').click();

    // Check that totals match.
    cy.get('#totals')
      .should('contain', 'Total is 30 EUR of which each participants share is 15 EUR');

    // Check that payments match.
    const payments = cy.get('.payment');
    payments.should('have.length', 1);
    payments.first().should('contain', 'bob pays:5 EURmary');

    // Save bill with mocked response.
    cy.fixture('sample_bill.json').as('sample_bill');
    cy.server();
    cy.route({
      method: 'POST',
      url: 'http://localhost:5000/api/bill',
      response: '@sample_bill',
      delay: 2000 // Delay so we can check for notifications that are displayed on requests over 1s
    });

    cy.get('#save').click();

    // Check that loader is now visible.
    cy.get('#loader').should('be.visible');

    // Check that URL changed.
    cy.location('pathname').should('eq', `/${bid}`);

    // Check that notification is visible.
    cy.get('#notifications').within(() => {
      cy.get('.notification').first().should('contain', 'SuccessExpenses saved!');
    });

    // Check that notification is cleared
    cy.get('.notification').should('have.length', 0);

    // Check that loader is hidden again.
    cy.get('#loader').should('not.be.visible');

    // Check that delete button now exists
    cy.get('#delete').should('exist');
  });

  it('should render with saved data', () => {
    // Mock response.
    cy.fixture('sample_bill.json').as('sample_bill');
    cy.server();
    cy.route('GET', `http://localhost:5000/api/bill/${bid}`, '@sample_bill');

    cy.visit(`/${bid}`, {
      onBeforeLoad: (win) => {
        win.fetch = null; // eslint-disable-line no-param-reassign
      }
    });

    // Check title.
    cy.title().should('eq', 'YABSA - sample bill');

    // Check amount of persons.
    cy.get('.person').should('have.length', 2);

    // Bob
    cy.get('.person').first().within(() => {
      cy.get('.person__name').should('have.value', 'bob');
      cy.get('.person__amount').should('have.value', '10');
      cy.get('.person__total').should('contain', '10 EUR');
    });

    // Mary
    cy.get('.person').first().next().within(() => {
      cy.get('.person__name').should('have.value', 'mary');
      cy.get('.person__amount').should('have.value', '20');
      cy.get('.person__total').should('contain', '20 EUR');
    });

    // Buttons
    cy.get('#add').should('be.enabled');
    cy.get('#share').should('be.enabled');
    cy.get('#save').should('be.enabled');
    cy.get('#delete').should('be.enabled');

    // Check that totals match.
    cy.get('#totals')
     .should('contain', 'Total is 30 EUR of which each participants share is 15 EUR');

    // Check that payments match.
    const payments = cy.get('.payment');
    payments.should('have.length', 1);
    payments.first().should('contain', 'bob pays:5 EURmary');
  });

  it('should delete saved bill', () => {
    // Mock response.
    cy.fixture('sample_bill.json').as('sample_bill');
    cy.server();
    cy.route('GET', `http://localhost:5000/api/bill/${bid}`, '@sample_bill');

    cy.visit(`/${bid}`, {
      onBeforeLoad: (win) => {
        win.fetch = null; // eslint-disable-line no-param-reassign
      }
    });

    // Check title so rest of the tests wait for bill data to load.
    cy.title().should('eq', 'YABSA - sample bill');

    // Confirm not visible.
    cy.get('#confirm').should('not.be.visible');

    // Click delete button.
    cy.get('#delete').click();
    cy.get('#confirm').should('be.visible');

    // Click cancel.
    cy.get('#confirm--no').click();
    cy.get('#confirm').should('not.be.visible');
    cy.location('pathname').should('eq', `/${bid}`);

    // Mock response for deleting.
    cy.server();
    cy.route({
      method: 'DELETE',
      url: 'http://localhost:5000/api/bill',
      response: { bid },
      delay: 2000 // Delay so we can check for notifications that are displayed on requests over 1s
    });

    // Confirm delete.
    cy.get('#delete').click();
    cy.get('#confirm--yes').click();

    // Check that loader is now visible.
    cy.get('#loader').should('be.visible');

    cy.location('pathname').should('eq', '/');
    cy.get('#confirm').should('not.be.visible');
    cy.get('#loader').should('not.be.visible');

    // Check that notification is visible.
    cy.get('#notifications').within(() => {
      cy.get('.notification').first().should('contain', 'SuccessBill deleted!');
    });

    // Check that notification is cleared
    cy.get('.notification').should('have.length', 0);

    initialState();
  });
});

