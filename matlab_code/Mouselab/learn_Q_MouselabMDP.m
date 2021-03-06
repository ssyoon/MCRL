%%
addpath([pwd,'/MatlabTools/'])
%create meta-level MDP

add_pseudorewards=false;
pseudoreward_type='none';

mean_payoff=4.5;
std_payoff=10.6;

load('MouselabMDPExperiment_normalized')

actions_by_state{1}=[];
actions_by_state{2}=[1];
actions_by_state{3}=[2];
actions_by_state{4}=[3];
actions_by_state{5}=[4];
actions_by_state{6}=[1,1];
actions_by_state{7}=[2,2];
actions_by_state{8}=[3,3];
actions_by_state{9}=[4,4];
actions_by_state{10}=[1,1,2];
actions_by_state{11}=[1,1,4];
actions_by_state{12}=[2,2,3];
actions_by_state{13}=[2,2,4];
actions_by_state{14}=[3,3,2];
actions_by_state{15}=[3,3,4];
actions_by_state{16}=[4,4,3];
actions_by_state{17}=[4,4,1];
for e=1:numel(experiment)
    experiment(e).actions_by_state=actions_by_state;
    experiment(e).hallway_states=2:9;
    experiment(e).leafs=10:17;
    experiment(e).parent_by_state=[1,1,1,1,1,2,3,4,5,6,6,7,7,8,8,9,9];
end

costs=[0.05,0.10,0.20,0.40,0.80,1.60];

c=6;

meta_MDP=MouselabMDPMetaMDPNIPS(add_pseudorewards,pseudoreward_type,mean_payoff,std_payoff,experiment);
meta_MDP.cost_per_click=costs(c);

mu0=[1;1;1];
nr_features=numel(mu0);
sigma0=0.1;
glm0=BayesianGLM(nr_features,sigma0);
glm0.mu_n=mu0(:);

feature_extractor=@(s,c,meta_MDP) meta_MDP.extractStateActionFeatures(s,c);

%load MouselabMDPMetaMDPTestFeb-17-2017

nr_training_episodes=2000;
nr_reps=1;
first_episode=1; last_rep=nr_training_episodes;
for rep=1:nr_reps
    glm(rep)=glm0;
    tic()
    [glm(rep),MSE(first_episode:nr_training_episodes,rep),...
        returns(first_episode:nr_training_episodes,rep)]=BayesianSARSAQ(...
        meta_MDP,feature_extractor,nr_training_episodes-first_episode+1,glm(rep));
    disp(['Repetition ',int2str(rep),' took ',int2str(round(toc()/60)),' minutes.'])
end

clear avg_returns, clear sem_avg_return, clear avg_RMSE, clear sem_RMSE
bin_width=20;
for r=1:nr_reps
    [avg_returns(:,r),sem_avg_return(:,r)]=binnedAverage(returns(:,r),bin_width)
    [avg_RMSE(:,r),sem_RMSE(:,r)]=binnedAverage(sqrt(MSE(:,r)),bin_width);
end
best_run=argmax(avg_returns(end,:));

avg_MSE=mean(MSE(:,best_run),2);

R_total=mean(returns(:,best_run),2);

nr_episodes=size(R_total,1);
bin_width=50;
episode_nrs=bin_width:bin_width:nr_episodes;
[avg_RMSE,sem_RMSE]=binnedAverage(sqrt(avg_MSE),bin_width);
[avg_R,sem_R]=binnedAverage(R_total,bin_width);

figure()
subplot(2,1,1)
errorbar(episode_nrs,avg_R,sem_R,'g-o','LineWidth',2), hold on
set(gca,'FontSize',16)
xlabel('Episode','FontSize',16)
ylabel('R_{total}','FontSize',16),
title('Semi-gradient SARSA (Q) in Mouselab Task','FontSize',18)
%ylim([0,10])
xlim([0,nr_episodes+5])
%hold on
%plot(smooth(R_total,100),'r-')
%legend('RMSE','R_{total}')
xlabel('#Episodes','FontSize',16)
subplot(2,1,2)
errorbar(episode_nrs,avg_RMSE,sem_RMSE,'g-o','LineWidth',2), hold on
xlim([0,nr_episodes+5])
set(gca,'FontSize',16)
xlabel('Episode','FontSize',16)
ylabel('RMSE','FontSize',16),
%legend('with PR','without PR')
%hold on
%plot(smooth(R_total,100),'r-')
%legend('RMSE','R_{total}')
xlabel('#Episodes','FontSize',16)

feature_names=meta_MDP.feature_names;

weights=[glm(1:nr_reps).mu_n];
figure()
bar(weights),
%bar(w)
%ylim([0,0.3])
set(gca,'XTick',1:numel(feature_names),'XTickLabel',feature_names)
set(gca,'XTickLabelRotation',45,'FontSize',16)
ylabel('Learned Weights','FontSize',16)
title(['Bayesian SARSA without PR, ',int2str(nr_episodes),' episodes'],'FontSize',18)

nr_episodes_evaluation=20000;
meta_MDP.object_level_MDP=meta_MDP.object_level_MDPs(1);
policy=@(state,mdp) contextualThompsonSampling(state,meta_MDP,glm(best_run))
[R_total_evaluation,problems_evaluation,states_evaluation,chosen_actions_evaluation,indices_evaluation]=...
    inspectPolicyGeneral(meta_MDP,policy,nr_episodes_evaluation)

reward_learned_policy=[mean(R_total_evaluation),sem(R_total_evaluation)]
nr_observations_learned_policy=[mean(indices_evaluation.nr_acquisitions),...
    sem(indices_evaluation.nr_acquisitions(:))]

result.policy=policy;
result.reward=reward_learned_policy;
result.weights=weights;
result.features={'VPI','VOC','E[R|act,b]'};
result.nr_observations=nr_observations_learned_policy;
result.returns=R_total_evaluation;

do_save=true;
if do_save
    save ../results/MouselabMDPFitBayesianSARSA result
end
%% benchmark policy: observing everything before the first move

rmpath('/Users/Falk/Dropbox/PhD/Metacognitive RL/')

add_pseudorewards=false;
pseudoreward_type='none';

mean_payoff=4.5;
std_payoff=10.6;

load('MouselabMDPExperiment_normalized')

meta_MDP=MouselabMDPMetaMDPNIPS(add_pseudorewards,pseudoreward_type,mean_payoff,std_payoff,experiment)

policy=@(state,mdp) fullObservationPolicy(state,mdp)

nr_episodes_evaluation=20000;
[R_total,problems,states,chosen_actions,indices]=...
    inspectPolicyGeneral(meta_MDP,policy,nr_episodes_evaluation)

reward_full_observation_policy=[mean(R_total),sem(R_total)];
nr_observations_full_observation_policy=...
    [mean(indices.nr_acquisitions),sem(indices.nr_acquisitions(:))];

full_observation_benchmark.policy=policy;
full_observation_benchmark.reward=reward_full_observation_policy;
full_observation_benchmark.nr_observations=nr_observations_full_observation_policy;
full_observation_benchmark.returns=R_total;

save ../results/full_observation_benchmark full_observation_benchmark

%% comparison of learned policy against full-observation policy
costs=[0.01,0.05,0.10,0.20,0.40,0.80,1.60,2.00,2.40,2.80,3.20,6.40,12.80];
mu0(:,1)=[1;1;1];
mu0(:,2)=[0;0;0];
mu0(:,3)=[0;0;1];
mu0(:,4)=[0;1;0];
mu0(:,5)=[1;0;0];
mu0(:,6)=[1;1;0];
mu0(:,7)=[1;0;1];
mu0(:,8)=[0;1;1];

nr_initial_values=32;

for c=1:length(costs)

    cost=costs(c);
    load(['../results/full_observation_benchmark',int2str(100*cost),'.mat'])
    
    for init=1:nr_initial_values

        try
            filename=['../results/MouselabMDPFitBayesianSARSA',int2str(100*cost),'_',int2str(init),'.mat']
            load(filename)
        
            weights(:,c,init)=result.weights;
            BSARSA_performance(c,init)=result.reward(1);
            BSARSA_sem_performance(c,init)=result.reward(2);
            BSARSA_avg_nr_observations(c,init)=result.nr_observations(1);
            BSARSA_sem_nr_observations(c,init)=result.nr_observations(2);
            
            t(c,init)=(result.reward(1)-full_observation_benchmark.reward(1))/...
                sqrt(result.reward(2)^2+full_observation_benchmark.reward(2)^2);
            
            p(c,init)=1-normcdf(t(c,init))
            
            glms(c,init)=result.glm;
        catch
            disp(['Could''t load ',filename])
            BSARSA_performance(c,init)=NaN
            
        end
    end
    
    avg_performance.full_observation(c)=full_observation_benchmark.reward(1);
    sem_performance.full_observation(c)=full_observation_benchmark.reward(2);
    
    [avg_performance.BSARSAQ(c),best_initial_value]=max(BSARSA_performance(c,:));
    sem_performance.BSARSAQ(c)=BSARSA_sem_performance(c,best_initial_value);

    avg_nr_observations.BSARSAQ(c)=BSARSA_avg_nr_observations(c,best_initial_value);
    sem_nr_observations.BSARSAQ(c)=BSARSA_sem_nr_observations(c,best_initial_value);
    
    avg_nr_observations.full_observation(c)=full_observation_benchmark.nr_observations(1);
    sem_nr_observations.full_observation(c)=full_observation_benchmark.nr_observations(2);
    
    best_weights(:,c)=weights(:,c,best_initial_value);
    best_glms(c)=glms(c,best_initial_value);

end

BSARSA_results.best_weights=best_weights;
BSARSA_results.costs=costs;
BSARSA_results.avg_nr_observations=avg_nr_observations;
BSARSA_results.sem_nr_observations=sem_nr_observations;
BSARSA_results.avg_performance=avg_performance;
BSARSA_results.sem_performance=sem_performance;
BSARSA_results.glms=best_glms;

save('../results/BSARSA_results_Mouselab.mat','BSARSA_results')

%%
%meta-greedy policy
costs=[0.01,0.05,0.10,0.20,0.40,0.80,1.60,2.00,2.40,2.80,3.20,6.40,12.80];
parfor c=1:length(costs)
    [ER_meta_greedy(c,:),result_meta_greedy(c)]=evaluatePolicy([0;1;1],costs(c),1000)
end
save('../results/result_meta_greedy.mat','result_meta_greedy')

for i=1:numel(result_meta_greedy)
    sem_ER_greedy(i)=result_meta_greedy(i).reward(2);
    avg_ER_greedy(i)=result_meta_greedy(i).reward(1);
end

%no-deliberation policy
avg_reward_per_step=4.5; nr_steps=3;
performance_no_deliberation=nr_steps*avg_reward_per_step*ones(size(costs));

costs_BO=[0.01,1.60,2.80,12.80, 0.0500    0.2000    0.8000    2.4000];
for c=5:numel(costs_BO)
    load(['../results/BO_c',int2str(100*costs_BO(c)),'n',int2str(nb_iter),'.mat'])
    BO_results(c)=BO
    ER_BO(c)=BO.ER    
end

parfor c=5:8
    [ER_BO_validation(c,:),result_BO_validation(c)]=evaluatePolicy(BO_results(c).w_hat,costs_BO(c),1000)
end

temp=[result_BO_validation.reward];
ER_BO_validation=temp(1:2:end)
sem_BO_validation=temp(2:2:end)

BO_validation.ER=ER_BO_validation;
BO_validation.sem=sem_BO_validation;
BO_validation.cost=costs_BO;
save('../results/BO_validation.mat','BO_validation')

fig=figure(),
errorbar(costs_BO',BO_validation.ER,BO_validation.sem,'LineWidth',3),hold on
errorbar(costs',avg_performance.BSARSAQ,sem_performance.BSARSAQ,'LineWidth',3),hold on
errorbar(costs',avg_performance.full_observation,sem_performance.full_observation,'LineWidth',3),hold on
errorbar(costs,avg_ER_greedy,sem_ER_greedy,'LineWidth',3),hold on
plot(costs',performance_no_deliberation,'LineWidth',3),hold on
xlim([0.01,12.8])
ylim([0,40])
set(gca,'FontSize',16,'XScale','log')
xlabel('Cost per Click','FontSize',16)
ylabel('Expected return','FontSize',16)
legend('BO','BSARSA','Full-Deliberation Policy','Meta-Greedy Policy','No-Deliberation Policy','location','West')
saveas(fig,'../results/figures/MouselabEvaluation.fig')
saveas(fig,'../results/figures/MouselabEvaluation.png')

fig=figure(),
errorbar(costs',avg_nr_observations.BSARSAQ,sem_nr_observations.BSARSAQ,'LineWidth',3),hold on
errorbar(costs',avg_nr_observations.full_observation,sem_nr_observations.full_observation,'LineWidth',3),hold on
set(gca,'FontSize',16)
xlabel('Cost per Click','FontSize',16)
ylabel('#Observations','FontSize',16)
legend('BSARSA','Full-Observation Policy')
saveas(fig,'../results/figures/MouselabEvaluationNrObservations.fig')
saveas(fig,'../results/figures/MouselabEvaluationNrObservations.png')


fig_w=figure()
bar(best_weights')
set(gca,'XTickLabel',costs,'FontSize',16)
%set(gca,'XTick',costs,'XScale','log')
xlabel('Cost per click','FontSize',16)
legend(result.features)
ylabel('Weights','FontSize',16)
saveas(fig_w,'../results/figures/MouselabEvaluationBestWeights.fig')
saveas(fig_w,'../results/figures/MouselabEvaluationBestWeights.png')

%The policy learned by Bayesian SARSA algorithm achieved a significantly
%higher average return than the full-observation policy ($36.73 \pm 0.09$ vs. 
%36.41 \pm 0.09 points per trial, Z=2.66, p=0.004$).

%%

for c=1:numel(costs)
    load(['../results/BSARSA_evaluation',int2str(100*costs(c)),'.mat'])
    avg_performance.BSARSAQ_validation(c)=result.reward(1);
    sem_performance.BSARSAQ_validation(c)=result.reward(2);
    
    t_validation(c)=(avg_performance.BSARSAQ_validation(c)-avg_performance.full_observation(c))/...
        sqrt(sem_performance.BSARSAQ_validation(c)^2+sem_performance.full_observation(c)^2);
    
    p_validation(c)=1-normcdf(t_validation(c));
    
end

[costs;t_validation;p_validation]
%Starting with a cost of $0.20 per click, the policy learned by the
%Bayesian SARSA algorithm performs significantly better than the
%full-observation policy (Z=2.59, p=0.0049) and its advantage increases with the cost per
%observation from $1.23 per trial for a cost of $0.20 per click to $179.85 per trial for a cost of $12.80 per click.
%For time costs, of less than $0.20 there was no significant difference
%between the average reward attained by the two policies, although the
%policy learned by BSARSA collected significantly less information than the
%full-observation policy ($13.4 \pm 0.04$ vs. 16 inspections per trial, Z=-65.38, p=<0.0001).

mean(avg_nr_observations.BSARSAQ(1:3))

%% 
load BO_c160n25.mat

w_policy=[0.6,0.9,1]';
glm_policy=BayesianGLM(3);
glm_policy.sigma=0.0001;
glm_policy.mu_n=w_policy;
glm_policy.mu_0=w_policy;
nr_episodes=1000;

addpath([pwd,'/MatlabTools/'])
%create meta-level MDP

add_pseudorewards=false;
pseudoreward_type='none';

mean_payoff=4.5;
std_payoff=10.6;

load('MouselabMDPExperiment_normalized')

actions_by_state{1}=[];
actions_by_state{2}=[1];
actions_by_state{3}=[2];
actions_by_state{4}=[3];
actions_by_state{5}=[4];
actions_by_state{6}=[1,1];
actions_by_state{7}=[2,2];
actions_by_state{8}=[3,3];
actions_by_state{9}=[4,4];
actions_by_state{10}=[1,1,2];
actions_by_state{11}=[1,1,4];
actions_by_state{12}=[2,2,3];
actions_by_state{13}=[2,2,4];
actions_by_state{14}=[3,3,2];
actions_by_state{15}=[3,3,4];
actions_by_state{16}=[4,4,3];
actions_by_state{17}=[4,4,1];
for e=1:numel(experiment)
    experiment(e).actions_by_state=actions_by_state;
    experiment(e).hallway_states=2:9;
    experiment(e).leafs=10:17;
    experiment(e).parent_by_state=[1,1,1,1,1,2,3,4,5,6,6,7,7,8,8,9,9];
end

costs=[0.05,0.10,0.20,0.40,0.80,1.60];

c=6;

meta_MDP=MouselabMDPMetaMDPNIPS(add_pseudorewards,pseudoreward_type,mean_payoff,std_payoff,experiment);
meta_MDP.cost_per_click=costs(c);

feature_extractor=@(s,c,meta_MDP) meta_MDP.extractStateActionFeatures(s,c);

[glm_Q,MSE,R_total]=BayesianValueFunctionRegression(meta_MDP,feature_extractor,nr_episodes,glm_policy)

figure()
bar(glm_Q.mu_n)
set(gca,'XTickLabel',{'VPI','VOC_1','E[R|act,b]'},'FontSize',16)

figure()
plot(smooth(MSE,250))

%% 
costs=[0.01,0.05*power(2,0:8)];
blinkered.costs=costs;
for c=1:numel(costs)
    load(['../results/performance_blinkered_approximation_c',int2str(100*costs(c)),'.mat'])
    blinkered.ER(c)=result.ER(1);
    blinkered.sem_ER(c)=result.ER(2);
    blinkered.nr_computations(c)=result.nr_computations(1);
    blinkered.sem_nr_computations(c)=result.nr_computations(2);
end

save('../results/blinkered.mat','blinkered')

%%
costs=[0.01,0.05,0.10,0.20,0.40,0.80,1.60,2.00,2.40,2.80,3.20,6.40,12.80];
for c=1:numel(costs)
    load(['../results/BSARSA_evaluation',int2str(100*costs(c)),'.mat'])
    avg_performance.BSARSAQ_validation(c)=result.reward(1);
    sem_performance.BSARSAQ_validation(c)=result.reward(2);
    
    BSARSA.ER(c)=result.reward(1);
    BSARSA.sem_ER(c)=result.reward(2);
    BSARSA.cost(c)=costs(c);
    
    cost=costs(c);
    load(['../results/full_observation_benchmark',int2str(100*cost),'.mat'])
        
    avg_performance.full_observation(c)=full_observation_benchmark.reward(1);
    sem_performance.full_observation(c)=full_observation_benchmark.reward(2);
    
    full_observation.ER(c)=full_observation_benchmark.reward(1);
    full_observation.sem_ER(c)=full_observation_benchmark.reward(2);
    full_observation.cost(c)=costs(c);
    
    t_validation(c)=(avg_performance.BSARSAQ_validation(c)-avg_performance.full_observation(c))/...
        sqrt(sem_performance.BSARSAQ_validation(c)^2+sem_performance.full_observation(c)^2);
    
    p_validation(c)=1-normcdf(t_validation(c));
        
end

save('../results/BSARSA.mat','BSARSA')
save('../results/full_observation.mat','full_observation')

%%
load('../results/result_meta_greedy')
for i=1:numel(result_meta_greedy)
    sem_ER_greedy(i)=result_meta_greedy(i).reward(2);
    avg_ER_greedy(i)=result_meta_greedy(i).reward(1);
end

costs=[0.01,0.05,0.10,0.20,0.40,0.80,1.60,2.00,2.40,2.80,3.20,6.40,12.80];

greedy.ER=avg_ER_greedy;
greedy.sem_ER=sem_ER_greedy;
greedy.cost=costs;
save('../results/greedy.mat','greedy')

%no-deliberation policy
avg_reward_per_step=4.5; nr_steps=3;
performance_no_deliberation=nr_steps*avg_reward_per_step*ones(size(costs));

no_deliberation.ER=performance_no_deliberation;
no_deliberation.sem_ER=zeros(size(performance_no_deliberation));
no_deliberation.cost=costs;

save('../results/no_deliberation.mat','no_deliberation')