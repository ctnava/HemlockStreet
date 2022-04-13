import React from 'react';
import { InputGroup, Form, FormControl, DropdownButton, Dropdown, Row, Col, Button } from 'react-bootstrap'

function Query(props) {
    const query = props.query;
    const setQuery = props.setQuery;
    const showQueryField = props.showQueryField;
    const setShowQueryField = props.setShowQueryField;

    function handleClick(event) {
        const name = event.target.name;
        const value = showQueryField[name];
        setShowQueryField({...showQueryField, [name]:!value});
    }

    function handleChange(event) {
        event.preventDefault();
        const name = event.target.name;
        const value = event.target.value;
        setQuery((prev) => {return {...prev, [name]:value}});
    }

    function QueryField(props) {
        return(<Row>
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>{props.text}</InputGroup.Text>
                <FormControl 
                type="text" 
                name={props.field}
                onChange={(event) => {handleChange(event)}} 
                placeholder="..."
                value={props.value}
                />
                <Button name={props.field} variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Row>);
    }

    const allFieldsShown = (showQueryField.name && showQueryField.type && showQueryField.memo && showQueryField.hash && showQueryField.timestamp && showQueryField.size && showQueryField.from && showQueryField.to);
    return(<div>
        { !allFieldsShown && (
        <DropdownButton variant="secondary" className="mb-3 my-3" title="Field Query">
            {!showQueryField.name && (<Dropdown.Item name="name" onClick={handleClick}>File Name</Dropdown.Item>)}
            {!showQueryField.type && (<Dropdown.Item name="type" onClick={handleClick}>File Type</Dropdown.Item>)}
            {!showQueryField.memo && (<Dropdown.Item name="memo" onClick={handleClick}>File Memo</Dropdown.Item>)}
            {!showQueryField.hash && (<Dropdown.Item name="hash" onClick={handleClick}>IPFS CID (Hash)</Dropdown.Item>)}
            {!showQueryField.timestamp && (<Dropdown.Item name="timestamp" onClick={handleClick}>Timestamp</Dropdown.Item>)}
            {!showQueryField.size && (<Dropdown.Item name="size" onClick={handleClick}>File Size</Dropdown.Item>)}
            {!showQueryField.from && (<Dropdown.Item name="from" onClick={handleClick}>Sender Address</Dropdown.Item>)}
            {!showQueryField.to && (<Dropdown.Item name="to" onClick={handleClick}>Recipient Address</Dropdown.Item>)}
        </DropdownButton>)}
        
        <Form>
        { showQueryField.name && (<QueryField text="File Name" field="name" value={query.name} />) }
        { showQueryField.type && (<QueryField text="File Type" field="type" value={query.type} />) }
        { showQueryField.memo && (<QueryField text="File Memo" field="memo" value={query.memo} />) }
        { showQueryField.hash && (<QueryField text="IPFS CID (Hash)" field="hash" value={query.hash} />) }
        { showQueryField.timestamp && (<QueryField text="Timestamp" field="timestamp" value={query.timestamp} />) }
        { showQueryField.size && (<QueryField text="File Name" field="size" value={query.size} />) }
        { showQueryField.from && (<QueryField text="Sender Address" field="from" value={query.from} />) }
        { showQueryField.to && (<QueryField text="Recipient Address" field="to" value={query.to} />) }
        </Form>
        
    </div>);
}

export default Query;