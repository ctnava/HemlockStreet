import React from 'react';
import { InputGroup, Form, DropdownButton, Dropdown, Row, Col, Button } from 'react-bootstrap'

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
        const { name, value } = event.target;
        setQuery(prev => {
            return {...query, [name]:value};
        });
        console.log(query);
        event.preventDefault();
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
        { showQueryField.name && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Name</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="name"
                onChange={handleChange} 
                placeholder="..."
                value={query.name}
                autoComplete="off"
                />
                <Button name="name" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group> 
        </div>) }

        { showQueryField.type && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Type</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="type"
                onChange={handleChange} 
                placeholder="..."
                value={query.type}
                autoComplete="off"
                />
                <Button name="type" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group> 
        </div>) }

        { showQueryField.memo && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Memo</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="memo"
                onChange={handleChange} 
                placeholder="..."
                value={query.memo}
                autoComplete="off"
                />
                <Button name="memo" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>   
        </div>) }

        { showQueryField.hash && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>IPFS CID (Hash)</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="hash"
                onChange={handleChange} 
                placeholder="..."
                value={query.hash}
                autoComplete="off"
                />
                <Button name="hash" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.timestamp && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>Timestamp</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="timestamp"
                onChange={handleChange} 
                placeholder="..."
                value={query.timestamp}
                autoComplete="off"
                />
                <Button name="timestamp" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.size && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>File Size</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="size"
                onChange={handleChange} 
                placeholder="..."
                value={query.size}
                autoComplete="off"
                />
                <Button name="size" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.from && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>Sender Address</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="from"
                onChange={handleChange} 
                placeholder="..."
                value={query.from}
                autoComplete="off"
                />
                <Button name="from" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) }

        { showQueryField.to && (<div>
        <Form.Group className="row">
            <InputGroup className="mb-3 my-3">
                <InputGroup.Text>Recipient Address</InputGroup.Text>
                <Form.Control 
                type="text" 
                name="to"
                onChange={handleChange} 
                placeholder="..."
                value={query.to}
                autoComplete="off"
                />
                <Button name="to" variant="secondary" onClick={handleClick}>Close</Button>
            </InputGroup>
        </Form.Group>    
        </div>) } 
        </Form>
    </div>);
}

export default Query;