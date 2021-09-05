import axios from 'axios';
import {APIRootPath} from '@fed-exam/config';
import { reverse } from 'dns';

export type Ticket = {
    id: string,
    title: string;
    content: string;
    creationTime: number;
    userEmail: string;
    labels?: string[];
}

export type ServerResponse = {
    tickets : Ticket[];
    lastPage : string;
}

export type ApiClient = {
    getTickets: (page : number, sortBy: string, reverse: string, searchVal: string) => Promise<ServerResponse>;
}

export const createApiClient = (): ApiClient => {
    return {
        getTickets: (page : number, sortBy: string, reverse: string, searchVal: string) => {
            return axios.get(APIRootPath, {params: {page: page, sortBy: sortBy, reverse: reverse, searchVal: searchVal}}).then((res) => res.data);
        }
    }
}