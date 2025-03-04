import * as tap from 'tap';
import * as sinon from 'sinon';
import * as _ from 'lodash';
import * as fs from 'fs';

// tslint:disable-next-line:no-var-requires
const snykTest = require('../../src/cli/commands/test');
import * as snyk from '../../src/lib';

const {test} = tap;
(tap as any).runOnly = false; // <- for debug. set to true, and replace a test to only(..)

test('`test ruby-app` remediation displayed',  async (t) => {
  chdirWorkspaces();
  const stubbedResponse = JSON.parse(
    fs.readFileSync(__dirname + '/workspaces/ruby-app/test-graph-response-with-remediation.json', 'utf8'),
  );
  const snykTestStub = sinon.stub(snyk, 'test').returns(stubbedResponse);
  try {
    await snykTest('ruby-app');
  } catch (error) {
    const res = error.message;
    t.match(res, 'Upgrade rails@5.2.3 to rails@5.2.3 to fix', 'upgrade advice displayed');
    t.match(res, 'Tested 52 dependencies for known issues');
    t.match(res, 'This issue was fixed in versions: 1.2.3', 'fixed in is shown');
    t.match(res, 'No upgrade or patch available', 'some have no upgrade or patch');
  }

  snykTestStub.restore();
  t.end();
});

function chdirWorkspaces(subdir: string = '') {
  process.chdir(__dirname + '/workspaces' + (subdir ? '/' + subdir : ''));
}
