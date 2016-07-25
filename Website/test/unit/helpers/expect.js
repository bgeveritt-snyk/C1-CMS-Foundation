import './emulateDom';


import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import unexpectedSinon from 'unexpected-sinon';
import unexpectedDom from 'unexpected-dom';
import TestUtils from 'react-addons-test-utils';

// define our instance of the `expect` function to use
const expect = unexpected.clone()
	.use(unexpectedDom)
	.use(unexpectedReact)
	.use(unexpectedSinon);

// Custom assertions
expect.addAssertion('<RenderedReactElement> finding DOM tag <string> <assertion?>', function (expect, subject, tagName) {
	let element = TestUtils.findRenderedDOMComponentWithTag(subject, tagName);
	return expect.shift(element);
});

expect.addAssertion('<ReactElement> to have props satisfying <any>', function (expect, subject, model) {
	let props = subject.props;
	return expect(props, 'to satisfy', model);
});

expect.addAssertion('<object> to be an action of type <string>', function (expect, subject, actionName) {
	return expect(subject, 'to have own property', 'type', actionName);
});

export default expect;