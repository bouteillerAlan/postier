import {HttpMethod} from "../types/types.ts";

export const HttpMethodColorRadixUI = (method: HttpMethod) => {
    switch (method) {
        case 'GET':
            return 'green';
        case 'POST':
            return 'amber';
        case 'PUT':
            return 'blue';
        case 'DELETE':
            return 'red';
        case 'HEAD':
            return 'green';
        case 'OPTIONS':
            return 'crimson';
        case 'PATCH':
            return 'purple';
        default:
            return 'gray';
    }
}

export const HttpMethodColorCustom = (method: HttpMethod) => {
    switch (method) {
        case 'GET':
            return 'var(--green-5)';
        case 'POST':
            return 'var(--amber-5)';
        case 'PUT':
            return 'var(--blue-5)';
        case 'DELETE':
            return 'var(--red-5)';
        case 'HEAD':
            return 'var(--green-5)';
        case 'OPTIONS':
            return 'var(--crimson-5)';
        case 'PATCH':
            return 'var(--purple-5)';
        default:
            return 'var(--gray-5)';
    }
}