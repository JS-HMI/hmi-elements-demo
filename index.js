import 'jashmi'
import 'valves'
import {Manager, fakeDataEngine  } from 'jashmi'

/*let engine = new JsonPollEngine("std",{
    readPrefix : "api/JSON/read",
    writePrefix: "api/JSON/write",
    readInterval_ms : 2000
});
*/



let engine = new fakeDataEngine("std");

Manager.AddEngine(engine);
Manager.Init();
