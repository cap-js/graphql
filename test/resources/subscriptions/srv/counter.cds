@protocol: [
  'odata',
  'graphql'
]
service CounterService {

  function getCounter() returns Integer;
  action   incCounter() returns Integer;
  action   decCounter() returns Integer;

  event CounterUpdated {
    counter : Integer;
  }
}
