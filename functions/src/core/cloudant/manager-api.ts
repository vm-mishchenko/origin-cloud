import {ServerScope} from '@cloudant/cloudant';

export class CloudantManagerApi {
    constructor(private username: string, private password: string, private domain: string,
                private cloudant: ServerScope) {
    }

    getCloudantUrl(): string {
        return `https://${this.username}:${this.password}@${this.domain}`;
    }
}
