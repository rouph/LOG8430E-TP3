/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

const owners = ['Alice', 'Bob', 'Claire', 'David'];

/**
 * Workload module for the benchmark round.
 */
class readWrite extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.txIndex = 0;
        this.maxRead = 200;
        this.maxWrite = 200;
        this.curentRead = 0;
        this.curentWrite = 0;
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        this.txIndex++;
        let marbleName = 'marble_' + this.txIndex.toString() + '_' + this.workerIndex.toString();
        let newOwner = owners[(this.txIndex+1) % owners.length];
        const argsWrite = {
            contractId: 'marbles',
            contractVersion: 'v1',
            contractFunction: 'transferMarble',
            contractArguments: [marbleName, newOwner],
            timeout: 120
        };
        const argsRead = {
            contractId: 'marbles',
            contractVersion: 'v1',
            contractFunction: 'readMarble',
            contractArguments: [marbleName],
            timeout: 120,
            readOnly: true
        };
        
        let choice = this.getRandomInt(2)
        if(choice == 0 && this.curentRead > this.maxRead )
            choice = 1;
        else if(choice == 1 && this.curentWrite > this.maxWrite )
            choice = 0;
        const args = (choice == 1)?argsWrite:argsRead;
        if(choice)
            this.curentWrite++;
        else
            this.curentRead++;
        await this.sutAdapter.sendRequests(args);
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new readWrite();
}

module.exports.createWorkloadModule = createWorkloadModule;
