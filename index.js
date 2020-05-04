import {Manager,JsonPollEngine,hmiElement, fakeDataEngine} from 'jashmi'
import 'valves'

/*let engine = new JsonPollEngine("std",{
    readPrefix : "api/JSON/read",
    writePrefix: "api/JSON/write",
    readInterval_ms : 2000
});
*/
let engine = new fakeDataEngine("std");

Manager.AddEngine(engine);
Manager.Init();

