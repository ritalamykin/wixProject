import internal from 'assert';
import React from 'react';
import './App.scss';
import Truncate from "react-truncate";
import PropTypes from "prop-types";
import ts from 'typescript';


export type TicketState = {
	title: string;
	expanded: boolean;
	truncated: boolean;
}

export type TicketProps = {
	title: string;
	content: string;
	userEmail: string;
	creationTime: number;
	id: string;
	labels?: string[];
}

export class TicketComponent extends React.PureComponent<TicketProps,TicketState> {
	constructor(props: TicketProps) {
		super(props);
		this.state = {
			title: props.title,
			expanded: false,
			truncated: false
		};
		this.handleTruncate = this.handleTruncate.bind(this);
    	this.toggleLines = this.toggleLines.bind(this);
	  }

	  handleTruncate(truncated: boolean) {
		if (this.state.truncated !== truncated) {
		  this.setState({
			truncated
		  });
		}
	  }

	  toggleLines() {
		console.log("this.state.expanded = " + this.state.expanded)
		this.setState({
		  expanded: !this.state.expanded
		});
	  }

	  // Called instead of constructor when we move to the next page
	  componentWillReceiveProps(props :TicketProps , current_state :TicketProps) {
		  this.setState({
			  title : props.title,
		  });
	  }

	  renameTitle(){
		var title = prompt("Please a new title", "Custom Title");
		if (title != null) {
			this.setState({
				title: title
			  });
		}
	  }

	  render(){
		const { expanded, truncated } = this.state;
		return(
		<li key={this.props.id} className='ticket'>
		<h5 className='title'>{this.state.title}</h5>
		<div className="App">
		<div>
          <Truncate
            lines={!expanded && 3}
            ellipsis={
              <span>
                ...{" "}
                <a href="#" onClick={()=>this.toggleLines()}>
					<div>
						<span className="showMoreLess">Show More</span>
					</div>
                </a>
              </span>
            }
            onTruncate={this.handleTruncate}>
            {this.props.content}
          </Truncate>
          {!truncated && expanded && (
            <span>
              {" "}
              <a href="#" onClick={() =>this.toggleLines()}>
			  	<span className="showMoreLess">Show Less</span>
              </a>
            </span>
          )}
        </div>
		</div>

		<button onClick={() => this.renameTitle()}>Rename</button>
		<footer>
			<div className='meta-data'>By {this.props.userEmail} | { new Date(this.props.creationTime).toLocaleString()}</div>
			<div className="labels">{this.props.labels ? this.props.labels.map((label) => 
			(<div className="label">{label}</div>)) : null }</div>
		</footer>
		</li>)
	  }
	}
	

	export default TicketComponent;
