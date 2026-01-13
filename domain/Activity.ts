// domain/Activity.ts
export class Activity {
    constructor(
        private readonly id: string,
        private readonly title: string,
        private readonly aircraft: string,
        private readonly hangarA: string,
        private readonly hangarB: string,
        private readonly date: Date,
        private readonly time: string,
        private readonly tailnumber: number,
        private readonly resources: string,
        private readonly employee: string,
        private readonly tags: string,
        private readonly isImportant: boolean = false
    ) {}

    occursOn(day: Date): boolean {
        return (
            this.date.getFullYear() === day.getFullYear() &&
            this.date.getMonth() === day.getMonth() &&
            this.date.getDate() === day.getDate()
        );
    }

    getId(): string {
        return this.id;
    }

    getTitle(): string {
        return this.title;
    }

    getAircraft(): string {
        return this.aircraft;
    }

    getHangars(): { from: string; to: string } {
        return { from: this.hangarA, to: this.hangarB };
    }

    getDate(): Date {
        return this.date;
    }

    getTime(): string {
        return this.time;
    }

    getEmployee(): string {
        return this.employee;
    }

    getTailnumber(): number {
        return this.tailnumber;
    }

    getResources(): string {
        return this.resources;
    }

    getTags(): string {
        return this.tags;
    }

    getIsImportant(): boolean {
        return this.isImportant;
    }
}
