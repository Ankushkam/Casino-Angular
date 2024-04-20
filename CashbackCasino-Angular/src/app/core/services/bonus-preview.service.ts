import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import * as _ from 'lodash';
@Injectable({
    providedIn: 'root'
  })
  export class BonusPreviewService {
    bonuses= new BehaviorSubject(null);

    playerGroups=[];

    constructor() {

    }

    setBonusesAvailability(bonuses, fields) {
        return bonuses.map((bonusesItem)=> {
            bonusesItem.bonuses.map((bonusItem)=> {
                bonusItem.isAvailable = bonusItem.conditions.every((condition)=> {
                    let isAvailable = true;
                    switch (condition.field) {
                        case 'currencies':
                            var hasConditionCurrency = _.includes(condition.value, fields.currency);
                            if (condition.type === 'inclusion') {
                                if (!hasConditionCurrency) {
                                    isAvailable = false;
                                }
                            }
                            if (condition.type === 'exclusion') {
                                if (hasConditionCurrency) {
                                    isAvailable = false;
                                }
                            }
                            if (condition.type === 'all') {
                                if (hasConditionCurrency) {
                                    if (condition.value.length !== 1) {
                                        isAvailable = false;
                                    }
                                } else {
                                    isAvailable = false;
                                }
                            }
                    }
                    return isAvailable;
                });

                return bonusItem;
            });


            return bonusesItem;
        });
    }


    setBonusesActivity(bonuses, fields) {
        let hasActiveBonus = false; // to show only one active bonus
        return bonuses.reduce((acc, bonusesItem)=> {
            acc.push(bonusesItem);

                bonusesItem.bonuses.map((bonusItem)=> {
                    bonusItem.isActive = false;
                    if (!hasActiveBonus) {
                        bonusItem.isActive = bonusItem.conditions.every((condition)=> {
                            let isActive = true;
                            switch (condition.field) {
                                case 'groups':
                                    if (condition.type === 'inclusion') {
                                        isActive = condition.value.some((item)=> {
                                            return _.includes(fields.groups, item);
                                        });
                                    }
                                    if (condition.type === 'exclusion') {
                                        isActive = condition.value.every((item) =>{
                                            return !_.includes(fields.groups, item);
                                        });
                                    }
                                    if (condition.type === 'all') {
                                        isActive = condition.value.every((item)=> {
                                            return _.includes(fields.groups, item);
                                        });
                                    }
                            }
                            return isActive;
                        });

                        hasActiveBonus = bonusItem.isActive;
                    }

                    return bonusItem;
                });

            return acc;
        }, []);
    }
  }