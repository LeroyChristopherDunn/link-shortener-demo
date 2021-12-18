import {Link} from "./LinkRepository";
import {Request} from "express-serve-static-core";

export type LinkEvent = {
    id?: number,
    dateUnix: number,
    link: Link,
    agent: string,
    referrer: string,
    ip: string,
}

export class MockLinkEventRepository{

    private events: LinkEvent[] = [];

    static fromRequest(req: Request, link: Link): LinkEvent{
        return {
            dateUnix: new Date().getTime(),
            link,
            agent: req.header('user-agent'),
            referrer: req.header('referrer') || null,
            ip: req.header('x-forwarded-for') || req.socket?.remoteAddress,
        }
    }

    save(event: LinkEvent): LinkEvent{
        event.id = this.events.length;
        this.events.push(event);
        return event;
    }

    findOne(id: number): LinkEvent | undefined{
        return this.events.find(event => event.id == id)
    }

    findAll(): LinkEvent[]{
        return this.events;
    }

    removeOne(id: number): boolean{
        const eventToRemove = this.findOne(id);
        if (!eventToRemove) return false;
        this.events = this.events.filter(event => event !== eventToRemove);
        return true;
    }
}
