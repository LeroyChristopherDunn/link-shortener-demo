
export type LinkUpdate = {
    path: string,
    redirectUrl: string,
}

export type Link = LinkUpdate & {
    url: string,
}

export class MockLinkRepository{

    private readonly links: {[path: string]: Link} = {};

    constructor(private readonly urlPrefix: string) {
        seedDb(link => this.save(link));
    }

    save(linkUpdate: LinkUpdate): Link{
        const link: Link = {
            ...linkUpdate,
            url: this.urlPrefix + '/' + linkUpdate.path,
        }
        this.links[linkUpdate.path] = link;
        return link;
    }

    findOne(path: string): Link | undefined{
        return this.links[path];
    }

    findAll(): Link[]{
        // @ts-ignore
        return Object.values(this.links);
    }

    removeOne(path: string): boolean{
        if (!this.links[path]) return false;
        delete this.links[path];
        return true;
    }

}

function seedDb(addLink: (link: LinkUpdate) => any){
    addLink({path: "1", redirectUrl: "https://www.google.com/search?q=1"});
    addLink({path: "2", redirectUrl: "https://www.google.com/search?q=2"});
    addLink({path: "3", redirectUrl: "https://www.google.com/search?q=3"});
    addLink({path: "4", redirectUrl: "https://www.google.com/search?q=4"});
    addLink({path: "5", redirectUrl: "https://www.google.com/search?q=5"});
}