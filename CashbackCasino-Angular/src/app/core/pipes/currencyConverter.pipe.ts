import { Pipe } from '@angular/core';

@Pipe({
    name: 'convertCurrency'
})

export class CurrencyConverterPipe {

    private currencies = [];
    private destinationCurrency;
    // private valueSubject = new BehaviorSubject(null);
    // private value = this.valueSubject.pipe(distinctUntilChanged(),
    // switchMap((amount) => {
    //     return this.httpService.getData(APIS.CURRENCIES).pipe(map((res)=>{
    //         this.currencies=res.body;
    //             let currencyData= this.currencies.find((obj)=>{
    //                 return obj.code==this.destinationCurrency;
    //             });
    //             return currencyData?(+amount)/(+currencyData.subunits_to_unit): amount;
    //     }));
    //     }));
    constructor() {
    }
    transform(value: any, currency: any[]) {
        this.destinationCurrency = currency[0];
        this.currencies = currency[1];
        if (this.currencies) {
            let currencyData = this.currencies.find((obj) => {
                return obj.code == this.destinationCurrency;
            });
            let data = currencyData ? (+value) / (+currencyData.subunits_to_unit) : value;
            if (data == NaN) {
                return 0;
            } else {
                return data;
            }
        }
        return value;
        // this.valueSubject.next(value);
        // return this.value;
    }
}