 
nr_trials = length(unique(trial_i));
for x = unique(info_cost)'
    idx = [data.info_cost1] == x;
    dat = data(idx);
    state_actions = [];
    trialID = [];
    rewardSeen = [];
    trialNr = [];
    for i = 1:length(dat)
        for t = 1:nr_trials
            
            
            
            cur_ID = dat(i).trialID(t);
            cur_rew = trial_properties(cur_ID+1).reward_by_state;
            trialID = [trialID,repmat(cur_ID,1,length(dat(i).clicks3{t})+3)];
            trialNr = [trialNr,repmat(t,1,length(dat(i).clicks3{t})+3)];
            
            sa = dat(i).clicks1{t};
            rewardSeen = [rewardSeen,cur_rew(sa),0];
            state_actions = [state_actions,sa,100+dat(i).path(t,2)];
            
            sa = dat(i).clicks2{t};
            new_idx = ~ismember(sa,dat(i).clicks1{t});
            new_sa = dat(i).clicks2{t}(new_idx);
            rewardSeen = [rewardSeen,cur_rew(new_sa),0];
            state_actions = [state_actions,new_sa,100+dat(i).path(t,3)];
            
            sa = dat(i).clicks3{t};
            new_idx = ~ismember(sa,dat(i).clicks2{t});
            new_sa = dat(i).clicks3{t}(new_idx);
            rewardSeen = [rewardSeen,cur_rew(new_sa),0];
            state_actions = [state_actions,new_sa,100+dat(i).path(t,4)];
        end
    end
    save(['1E_state-action_pairs/stateActions_',num2str(x)],'state_actions','trialID','rewardSeen','trialNr')
end