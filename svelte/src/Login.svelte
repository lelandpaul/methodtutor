<script>
  import { post } from './ajax.js';


  var email;
  var password;
  var flash = '';

  async function submit() {
    var resp = await post('login', {
      email: email,
      password: password
    });
    if (resp.success) {
      window.location.href="/";
    } else {
      email = '';
      password = '';
      flash = 'Email or password is incorrect.';
      console.log('bad login')
    }
  }

</script>

<div class="row">

  <div class="col">

    <div class="card">

      <div class="card-body">

        <h1 class="card-title">
          Method Tutor
        </h1>

        <h3 class="card-subtitle">
          Use your Ringing Room account to log in
        </h3>


        {#if flash}
          <strong>{flash}</strong>
        {/if}

        <div class="card-content">

          <form>

            <div class="form-group">

              <label for="emailInput">Email address</label>

              <input type="email" class="form-control" id="emailInput"
                     bind:value={email}>

            </div>

            <div class="form-group">

              <label for="passwordInput">Password</label>

              <input type="password" class="form-control" id="passwordInput"
                     bind:value={password}>

            </div>


            <button type="submit" class="btn btn-primary"
                    on:click|preventDefault={submit}>Log In</button>

          </form>

        </div>

      </div>

    </div>

  </div>

</div>


