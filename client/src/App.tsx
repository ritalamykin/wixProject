import React from 'react';
import './App.scss';
import { createApiClient, Ticket } from './api';
import { TicketComponent } from './TicketComponent';
import { Button, ButtonGroup, Dropdown } from 'semantic-ui-react';

export type AppState = {
	tickets?: Ticket[],
	search: string;
	page: number;
	lastPage: string;
	sortBy: string;
	selectedButton : string;
	reverseSort: string;
}

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {

	state: AppState = {
		search: '',
		page: 1,
		lastPage: "false",
		sortBy : "",
		selectedButton: "",
		reverseSort: "false",
	}

	searchDebounce: any = null;

	async componentDidMount() {
		this.setState({
			tickets: (await api.getTickets(this.state.page, this.state.sortBy, this.state.reverseSort, this.state.search)).tickets
		});
	}

	renderTickets = (tickets: Ticket[]) => {
		return (<ul className='tickets'>
			{tickets.map((t) => (
			<TicketComponent title={t.title} content={t.content} userEmail={t.userEmail} creationTime={t.creationTime} id={t.id} labels={t.labels}/>))};
		</ul>);
	}

	onSearch = async (val: string, newPage?: number) => {

		clearTimeout(this.searchDebounce);
		this.searchDebounce = setTimeout(async () => {
			this.setState({
				search: val,
				tickets: (await api.getTickets(this.state.page, this.state.sortBy, this.state.reverseSort, val)).tickets,
			});
		}, 300);
	}

	

	async incrementPage() {
		if (this.state.lastPage == "true") return;
		const newPageNumber = this.state.page + 1;
		let res = await api.getTickets(newPageNumber,this.state.sortBy, this.state.reverseSort, this.state.search);
		this.setState({
			page: newPageNumber,
			tickets: res.tickets,
			lastPage: res.lastPage,
		})
	}

	async decrementPage() {
		if (this.state.page == 1) return;
		const newPageNumber = this.state.page - 1;
		this.setState({
			page: newPageNumber,
			tickets: (await api.getTickets(newPageNumber, this.state.sortBy, this.state.reverseSort, this.state.search)).tickets
		})
	}
	
	async sortBy(sortBy:string){
		let currReverseState = this.state.reverseSort;
		
		// Same button selected.
		if(this.state.selectedButton === sortBy){
			if(this.state.reverseSort === "true" ){
				currReverseState = "false";
			}
			else{
				currReverseState = "true";
			}
		// New button selected.
		} else {
			currReverseState = "false";
		}
		this.setState({
			sortBy : sortBy,
			selectedButton : sortBy,
			reverseSort : currReverseState,
			tickets: (await api.getTickets(this.state.page, sortBy, currReverseState, this.state.search)).tickets
		})
	}
		
	render() {
		const { tickets } = this.state;

		return (<main>
			<h1>Tickets List</h1>
			
			<header>
				<input type="search" placeholder="Search..." onChange={(e) => this.onSearch(e.target.value)} />
			</header>
			{/* <Dropdown>
  			<Dropdown.Toggle variant="success" id="dropdown-basic">
    			Dropdown Button
  			</Dropdown.Toggle>

  			<Dropdown.Menu>
    			<Dropdown.Item href="#/action-1">Action</Dropdown.Item>
				<Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
				<Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
				</Dropdown.Menu>
				</Dropdown> */}
			<div>Sort By</div>
			<ButtonGroup aria-label="outlined primary button group">
				<button className={this.state.selectedButton === "Email" ? 'selected' : ''} onClick={() => this.sortBy("Email")}>Email</button>
				<button className={this.state.selectedButton === "Title" ? 'selected' : ''} onClick={() => this.sortBy("Title")}>Title</button>
  				<button className={this.state.selectedButton === "Date" ? 'selected' : ''} onClick={() => this.sortBy("Date")}>Date</button>
			</ButtonGroup>
			
			{tickets ? <div className='results'>Showing {tickets.length} results</div> : null}
			{tickets ? this.renderTickets(tickets) : <h2>Loading..</h2>}
			<div className='pageButtons'>
				<button onClick={() => this.decrementPage()}>Previous Page</button>
				<button onClick={() => this.incrementPage()}>Next Page</button>
			</div>
		</main>)
	}
}

export default App;
