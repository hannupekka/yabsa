import { fromJS, Map } from 'immutable';
import shareExpenses from 'utils/payments';

describe('payments', () => {
  it('should not calculate anything for empty data', () => {
    const data = Map();
    const expected = {
      payments: {},
      share: 0,
      totalAmount: 0
    };
    expect(shareExpenses(data).toJS()).toEqual(expected);
  });

  it('should not split even bills', () => {
    const data = fromJS({
      bob: {
        id: 'bob',
        name: 'Bob',
        amount: '10 20'
      },
      john: {
        id: 'john',
        name: 'John',
        amount: '10 20'
      }
    });

    const expected = {
      payments: {},
      share: 30,
      totalAmount: 60
    };

    expect(shareExpenses(data).toJS()).toEqual(expected);
  });

  it('should split evenly for two people', () => {
    const data = fromJS({
      bob: {
        id: 'bob',
        name: 'Bob',
        amount: '10 20'
      },
      john: {
        id: 'john',
        name: 'John',
        amount: '20 40'
      }
    });

    const expected = {
      payments: {
        bob: {
          from: 'Bob',
          to: [
            {
              name: 'John',
              amount: 15
            }
          ]
        }
      },
      share: 45,
      totalAmount: 90
    };

    expect(shareExpenses(data).toJS()).toEqual(expected);
  });

  it('should match share to amount left to paid when initially paid nothing', () => {
    const data = fromJS({
      bob: {
        id: 'bob',
        name: 'Bob',
        amount: ''
      },
      john: {
        id: 'john',
        name: 'John',
        amount: '91.11'
      }
    });

    const expected = {
      payments: {
        bob: {
          from: 'Bob',
          to: [
            {
              name: 'John',
              amount: 45.56
            }
          ]
        }
      },
      share: 45.56,
      totalAmount: 91.11
    };

    expect(shareExpenses(data).toJS()).toEqual(expected);
  });

  it('should split data for multiple persons', () => {
    const data = fromJS({
      bob: {
        id: 'bob',
        name: 'Bob',
        amount: '30'
      },
      john: {
        id: 'john',
        name: 'John',
        amount: '123.44'
      },
      alice: {
        id: 'alice',
        name: 'Alice',
        amount: '0'
      }
    });

    const expected = {
      payments: {
        alice: {
          from: 'Alice',
          to: [
            {
              name: 'John',
              amount: 51.15
            }
          ]
        },
        bob: {
          from: 'Bob',
          to: [
            {
              name: 'John',
              amount: 21.15
            }
          ]
        }
      },
      share: 51.15,
      totalAmount: 153.44
    };

    expect(shareExpenses(data).toJS()).toEqual(expected);
  });

  it('should split data correctly when one person pays to multiple persons', () => {
    const data = fromJS({
      bob: {
        id: 'bob',
        name: 'Bob',
        amount: '50 40 20' // 110
      },
      john: {
        id: 'john',
        name: 'John',
        amount: '60 30' // 90
      },
      alice: {
        id: 'alice',
        name: 'Alice',
        amount: '10'
      }
    });

    const expected = {
      payments: {
        alice: {
          from: 'Alice',
          to: [
            {
              name: 'Bob',
              amount: 40
            },
            {
              name: 'John',
              amount: 20
            }
          ]
        }
      },
      share: 70,
      totalAmount: 210
    };

    expect(shareExpenses(data).toJS()).toEqual(expected);
  });
});
