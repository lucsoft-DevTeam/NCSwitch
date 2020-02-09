/**
 * THIS IS NOT A STANDERT MODULE
 */

export class BootUpTracker
{
    private bootedUpAt: number;
    constructor()
    {
        this.bootedUpAt = new Date().getTime();
    }

    bootUpFinished(): number
    {
        return new Date().getTime() - this.bootedUpAt;
    }
}